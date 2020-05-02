import { Box, xxlCheck, getRandomItem, cloneJsonData } from './lib/util'
const { ccclass, property } = cc._decorator

const line = 10
const column = 10
const types = [
    { type: -1, color: '888888' }, // 实体格子
    { type: 0, color: '000000' }, // 空格子
    { type: 1, color: 'ff0000' },
    { type: 2, color: 'ffff00' },
    { type: 3, color: '00ff00' },
    { type: 4, color: '00ffff' },
    { type: 5, color: 'ff00ff' },
    { type: 6, color: 'ffffff' },
]

const initTypes = types.filter((item) => item.type > 0)

@ccclass
export default class Main extends cc.Component {
    @property(cc.Prefab) Box: cc.Prefab = null
    @property(cc.Button) reloadButton: cc.Button = null
    @property(cc.Button) debugReloadButton: cc.Button = null

    createHistory = []
    selectHistory = []
    idCount = 0

    list: Box[] = []
    selectA: Box = null
    selectB: Box = null
    checking: boolean = false

    messageComponent: cc.Label = null

    _score: number = 0
    get score() {
        return this._score
    }
    set score(value: number) {
        this._score = value
        this.scoreComponent.string = value + ''
    }

    scoreComponent: cc.Label = null

    createBox(): Box {
        const index = this.idCount
        const box: Box = {
            id: index,
            x: index % line,
            y: Math.floor(index / line),
            checked: false,
            selected: false,
            type: 0,
            color: '',
            node: cc.instantiate(this.Box),
        }

        let randomItem = getRandomItem(initTypes)

        if (this.createHistory[this.idCount]) {
            randomItem = this.createHistory[this.idCount]
        }

        Object.assign(box, randomItem)

        this.createHistory.push(randomItem)
        this.idCount++

        // @ts-ignore
        box.node.color = cc.color(box.color)
        box.node.setPosition(this.getBoxPosition(box))
        box.node.getComponentInChildren(cc.Label).string = box.x + ',' + box.y
        box.node.on(cc.Node.EventType.TOUCH_START, () => {
            this.select(box)
        })

        return box
    }

    getBoxPosition(box: Box): cc.Vec2 {
        return cc.v2((box.x - line / 2) * 36, (box.y - column / 2) * 36)
    }

    getBox(x: number, y: number) {
        return this.list[y * line + x] || null
    }

    setSelectA(box: Box) {
        box.selected = true
        box.node.children[0].active = true
        this.selectA = box
    }

    setSelectB(box: Box) {
        box.selected = true
        box.node.children[0].active = true
        this.selectB = box

        const { x: x1, y: y1 } = this.selectA
        const { x: x2, y: y2 } = this.selectB
        const indexA = y1 * line + x1
        const indexB = y2 * line + x2

        this.checking = true
        this.selectA.x = x2
        this.selectA.y = y2
        this.selectB.x = x1
        this.selectB.y = y1

        this.selectA.node.getComponentInChildren(cc.Label).string = this.selectA.x + ',' + this.selectA.y
        this.selectB.node.getComponentInChildren(cc.Label).string = this.selectB.x + ',' + this.selectB.y

        this.selectA.node.runAction(cc.moveTo(0.3, this.getBoxPosition(this.selectA)))
        this.selectB.node.runAction(cc.moveTo(0.3, this.getBoxPosition(this.selectB)))

        setTimeout(() => {
            this.list[indexA] = this.selectB
            this.list[indexB] = this.selectA

            if (this.check([this.selectA, this.selectB]) == false) {
                this.selectA.x = x1
                this.selectA.y = y1
                this.selectB.x = x2
                this.selectB.y = y2
                this.selectA.node.getComponentInChildren(cc.Label).string = this.selectA.x + ',' + this.selectA.y
                this.selectB.node.getComponentInChildren(cc.Label).string = this.selectB.x + ',' + this.selectB.y
                this.selectA.node.runAction(cc.moveTo(0.3, this.getBoxPosition(this.selectA)))
                this.selectB.node.runAction(cc.moveTo(0.3, this.getBoxPosition(this.selectB)))
                this.list[indexA] = this.selectA
                this.list[indexB] = this.selectB
                setTimeout(() => {
                    this.checking = false
                }, 300)
            }

            this.selectA.selected = false
            this.selectB.selected = false
            this.selectA.node.children[0].active = false
            this.selectB.node.children[0].active = false
            this.selectA = null
            this.selectB = null
        }, 400)
    }

    updateList(updateColumnList: Box[][], unionList: Box[]) {
        const newCheckListPosition = unionList.map(({ x, y }) => {
            return { x, y }
        })

        updateColumnList.forEach((list) => {
            const filterEmptyBox = (box) => box.type == 0
            const filterNotEmptyBox = (box) => box.type != 0

            const x = list[0].x
            const emptyLength = list.filter(filterEmptyBox).length
            const insertBoxList = new Array(emptyLength).fill(null).map((_, index) => {
                const box = this.createBox()
                box.x = x
                box.y = column + index
                box.node.setPosition(this.getBoxPosition(box))
                box.node.runAction(cc.fadeIn(0.2))
                this.node.addChild(box.node)
                return box
            })

            list.push(...insertBoxList)
            const dropBoxList = list.filter(filterNotEmptyBox)

            setTimeout(() => {
                const getDropLength = (box: Box) => {
                    return list.slice(0, list.indexOf(box)).filter(filterEmptyBox).length
                }
                dropBoxList.forEach((box) => {
                    box.y -= getDropLength(box)
                    box.node.getComponentInChildren(cc.Label).string = box.x + ',' + box.y
                    this.list[box.y * line + box.x] = box
                    box.node.runAction(cc.moveTo(0.3, this.getBoxPosition(box)))
                })
            }, 500)
        })

        setTimeout(() => {
            const newCheckList = newCheckListPosition.map((p) => this.getBox(p.x, p.y))
            if (this.check(newCheckList) == false) {
                this.checking = false
            }
        }, 1500)
    }

    clear(clearList: Box[]) {
        clearList.forEach((box) => {
            box.type = 0
            box.node.runAction(cc.repeatForever(cc.sequence(cc.fadeOut(0.1), cc.fadeIn(0.1))))
        })

        this.score += clearList.length

        setTimeout(() => {
            clearList.forEach((box) => {
                box.node.destroy()
            })
        }, 500)
    }

    check(checkList: Box[]) {
        const result = xxlCheck(this.list, line, column, checkList)

        if (result) {
            this.clear(result.clearList)
            setTimeout(() => {
                this.updateList(result.updateColumnList, result.unionList)
            }, 500)

            return true
        }
        return false
    }

    select(box: Box) {
        if (this.checking) {
            return
        }

        if (box.type < 1) {
            return
        }

        this.selectHistory.push(this.list.indexOf(box))

        if (this.selectA == null) {
            this.setSelectA(box)
            return
        }

        if (this.selectA == box) {
            return
        }

        if (this.selectA.x == box.x && Math.abs(this.selectA.y - box.y) == 1) {
            this.setSelectB(box)
        } else if (this.selectA.y == box.y && Math.abs(this.selectA.x - box.x) == 1) {
            this.setSelectB(box)
        } else {
            this.selectA.selected = false
            this.selectA.node.children[0].active = false
            this.setSelectA(box)
        }
    }

    message(text: string) {
        this.messageComponent.string = text
    }

    initEvent() {
        this.reloadButton.node.on('click', () => {
            localStorage.createCache = ''
            localStorage.selectCache = ''
            location.reload()
        })

        this.debugReloadButton.node.on('click', () => {
            if (!localStorage.debugTipsCount) {
                localStorage.debugTipsCount = '0'
            }

            if (parseInt(localStorage.debugTipsCount) < 3) {
                alert('debug 模式重玩的话会把当前的操作记录和方块状态记录下来并自动播放 , 以便调试bug使用')
                localStorage.debugTipsCount = parseInt(localStorage.debugTipsCount) + 1
            }

            localStorage.createCache = JSON.stringify(this.createHistory)
            localStorage.selectCache = JSON.stringify(this.selectHistory)
            location.reload()
        })
    }

    initCache() {
        try {
            this.createHistory = JSON.parse(localStorage.createCache)
            const selectHistory = JSON.parse(localStorage.selectCache)

            if (selectHistory.length >= 2) {
                this.message('自动播放开始\n按"重新开始"可以退出debug模式继续游玩')
                let autoPlayTimeout = null
                const autoSelect = () => {
                    if (!this.checking) {
                        if (selectHistory.length == 0) {
                            this.message('自动播放结束!')
                            clearTimeout(autoPlayTimeout)
                            return
                        }

                        const selectValue = selectHistory.shift()
                        this.select(this.list[selectValue])
                    }

                    autoPlayTimeout = setTimeout(autoSelect, 500)
                }
                autoPlayTimeout = setTimeout(autoSelect, 1000)
            }
        } catch (err) {}
    }

    initView() {
        this.list = new Array(line * column).fill(null).map(() => {
            const box = this.createBox()
            this.node.addChild(box.node)
            return box
        })
    }

    initMessage() {
        const node = new cc.Node('MessageComponent')
        const label = node.addComponent(cc.Label)
        label.fontSize = 14
        label.lineHeight = 0
        node.setPosition(0, 260)
        this.node.parent.addChild(node)
        this.messageComponent = label
    }

    initScore() {
        const node = new cc.Node('Score')
        const label = node.addComponent(cc.Label)
        label.fontSize = 16
        label.lineHeight = 0

        node.setPosition(140, 280)
        // @ts-ignore
        node.color = cc.color('ffff00')

        this.node.parent.addChild(node)
        this.scoreComponent = label
        this.score = 0
    }

    start() {
        // @ts-ignore
        window.m = this

        this.initMessage()
        this.initScore()
        this.initEvent()
        this.initCache()
        this.initView()
    }
}
