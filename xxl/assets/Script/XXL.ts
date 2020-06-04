import { Box , xxlCheck , getUpdateUnionList , getUpdateColumn } from './XXLCheck'
import Util from './Public/Util'
import { AnimeLine } from './Public/FrameAnime'
const { ccclass , property } = cc._decorator

const types = [
    { 'type' : -1 , 'color' : '888888' } , // 实体格子
    { 'type' : 0 , 'color' : '000000' } , // 空格子
    { 'type' : 1 , 'color' : 'ff0000' } ,
    { 'type' : 2 , 'color' : 'ffff00' } ,
    { 'type' : 3 , 'color' : '00ff00' } ,
    { 'type' : 4 , 'color' : '00ffff' } ,
    { 'type' : 5 , 'color' : 'ff00ff' } ,
    { 'type' : 6 , 'color' : 'ffffff' }
]

const initTypes = types.filter((item) => item.type > 0)

@ccclass
export default class XXL extends cc.Component {
    @property(cc.Prefab) Box: cc.Prefab = null

    touchTarget: cc.Node = null
    viewDirection = ''
    lastViewDirection = ''
    firstDirection = ''
    touchStartPosition: cc.Vec2 = null

    gridSize = 72
    line = 10
    column = 10

    createHistory = []
    selectHistory = []
    idCount = 0

    list: Box[] = []
    selectA: Box = null
    selectB: Box = null
    checking = false

    scoreComponent: cc.Label = null
    messageComponent: cc.Label = null

    _score = 0
    get score(): number {
        return this._score
    }
    set score(value: number) {
        this._score = value
        this.scoreComponent.string = String(value)
    }


    createBox(type?: number): Box {
        const index = this.idCount
        const box: Box = {
            'id' : index ,
            'x' : index % this.line ,
            'y' : Math.floor(index / this.line) ,
            'checked' : false ,
            'selected' : false ,
            'type' : 0 ,
            'color' : '' ,
            'node' : cc.instantiate(this.Box)
        }

        let randomItem = Util.getRandomItem(initTypes)

        if (this.createHistory[this.idCount]) {
            randomItem = this.createHistory[this.idCount]
        }

        if (typeof type === 'number') {
            randomItem = types.find((item) => item.type === type)
        }

        Object.assign(box , randomItem)

        this.createHistory.push(randomItem)
        this.idCount++

        // @ts-ignore
        box.node.color = cc.color(box.color)
        box.node.setPosition(this.getBoxPosition(box))
        box.node.getComponentInChildren(cc.Label).string = box.x + ',' + box.y
        box.node.on(cc.Node.EventType.TOUCH_START , this.touchStart , this)
        return box
    }

    getBoxPosition(box: Box): cc.Vec2 {
        return cc.v2((box.x - this.line / 2) * this.gridSize + this.gridSize/2 , (box.y - this.column / 2) * this.gridSize + this.gridSize/2)
    }

    getBox(x: number , y: number): Box {
        return this.list[y * this.line + x] || null
    }

    setSelectA(box: Box): void {
        box.selected = true
        box.node.children[0].active = true
        this.selectA = box
    }

    setSelectB(box: Box): void {

        box.selected = true
        box.node.children[0].active = true
        this.selectB = box

        const { 'x' : x1 , 'y' : y1 } = this.selectA
        const { 'x' : x2 , 'y' : y2 } = this.selectB
        const indexA = y1 * this.line + x1
        const indexB = y2 * this.line + x2

        this.checking = true
        this.selectA.x = x2
        this.selectA.y = y2
        this.selectB.x = x1
        this.selectB.y = y1

        this.selectA.node.getComponentInChildren(cc.Label).string = this.selectA.x + ',' + this.selectA.y
        this.selectB.node.getComponentInChildren(cc.Label).string = this.selectB.x + ',' + this.selectB.y

        const { 'x' : aX , 'y' : aY } = this.getBoxPosition(this.selectA)
        const { 'x' : bX , 'y' : bY } = this.getBoxPosition(this.selectB)

        new AnimeLine(this.selectA.node).anime(0.3 , { 'x' : aX , 'y' : aY }).run()
        new AnimeLine(this.selectB.node).anime(0.3 , { 'x' : bX , 'y' : bY }).run().end(() => {
            this.list[indexA] = this.selectB
            this.list[indexB] = this.selectA

            if (this.check([this.selectA , this.selectB]) === false) {
                this.selectA.x = x1
                this.selectA.y = y1
                this.selectB.x = x2
                this.selectB.y = y2
                this.selectA.node.getComponentInChildren(cc.Label).string = this.selectA.x + ',' + this.selectA.y
                this.selectB.node.getComponentInChildren(cc.Label).string = this.selectB.x + ',' + this.selectB.y

                this.list[indexA] = this.selectA
                this.list[indexB] = this.selectB

                new AnimeLine(this.selectA.node).anime(0.3 , { 'x' : bX , 'y' : bY }).run()
                new AnimeLine(this.selectB.node).anime(0.3 , { 'x' : aX , 'y' : aY }).run().end(() => {
                    this.checking = false
                })
            }

            this.selectA.selected = false
            this.selectB.selected = false
            this.selectA.node.children[0].active = false
            this.selectB.node.children[0].active = false
            this.selectA = null
            this.selectB = null
        })
    }

    updateList(clearList: Box[]): void {

        const unionList = getUpdateUnionList(clearList)
        const updateColumnList = getUpdateColumn(unionList)
        const newCheckListPosition = unionList.map(({ x , y }) => {
            return { x , y }
        })

        let maxAnimeTime = 0

        updateColumnList.forEach((list) => {

            const x = list[0].x
            const emptyLength = list.filter((box: Box) => box.type === 0).length
            const insertBoxList = new Array(emptyLength).fill(null).map((_ , index) => {
                const box = this.createBox()

                box.x = x
                box.y = this.column + index
                box.node.setPosition(this.getBoxPosition(box))
                this.node.addChild(box.node)
                new AnimeLine(box.node).anime({ 'opacity' : 0 }).anime(0.2 , { 'opacity' : 255 }).run()
                return box
            })

            list.push(...insertBoxList)

            const firstBoxY = list[0].y
            const newList = list.filter((box) => box.type > 0)
            let nowY = 0

            newList.forEach((box) => {
                box.y = firstBoxY + nowY
                if (list[nowY].type === -1) {
                    box.y++
                    nowY++
                }
                nowY++

                box.node.getComponentInChildren(cc.Label).string = box.x + ',' + box.y
                const { 'y' : positionY } = this.getBoxPosition(box)
                const nowPositionY = box.node.y
                const diff = nowPositionY - positionY
                const animeTime = diff / this.gridSize * 0.1

                maxAnimeTime = Math.max(maxAnimeTime , animeTime)
                new AnimeLine(box.node).anime(0.2).anime(animeTime , { 'y' : positionY }).run()
                this.list[box.y * this.line + box.x] = box
            })
        })

        new AnimeLine(null).anime(maxAnimeTime + 0.2).run().end(() => {
            const newCheckList = newCheckListPosition.map((p) => this.getBox(p.x , p.y))

            if (this.check(newCheckList) === false) {
                this.checking = false
            }
        })
    }

    clear(clearList: Box[]): void {
        this.checking = true
        clearList.forEach((box) => {
            box.type = 0
            new AnimeLine(box.node).anime(0.1 , { 'opacity' : 0 }).reverse().repeat(2).run().end(() => box.node.destroy())
        })

        this.score += clearList.length

        setTimeout(() => {
            this.updateList(clearList)
        } , 300)
    }

    check(checkList: Box[]): boolean {
        const clearList = xxlCheck(this.list , this.line , this.column , checkList)

        if (clearList) {
            this.clear(clearList)
            return true
        }

        return false
    }

    select(box: Box): void {
        if (this.checking) {
            return
        }

        if (box.type < 1) {
            return
        }

        this.selectHistory.push(this.list.indexOf(box))

        if (this.selectA === null) {
            this.setSelectA(box)
            return
        }

        if (this.selectA === box) {
            return
        }

        if (this.selectA.x === box.x && Math.abs(this.selectA.y - box.y) === 1) {
            this.setSelectB(box)
        } else if (this.selectA.y === box.y && Math.abs(this.selectA.x - box.x) === 1) {
            this.setSelectB(box)
        } else {
            this.selectA.selected = false
            this.selectA.node.children[0].active = false
            this.setSelectA(box)
        }
    }

    message(text: string): void {
        this.messageComponent.string = text
    }


    reload():void{

        localStorage.createCache = ''
        localStorage.selectCache = ''
        location.reload()
    }
    debugReload():void{

        if (!localStorage.debugTipsCount) {
            localStorage.debugTipsCount = '0'
        }

        if (parseInt(localStorage.debugTipsCount) < 3) {
            this.message('debug 模式重玩的话会把当前的操作记录和方块状态记录下来并自动播放 , 以便调试bug使用')
            setTimeout(() => {
                localStorage.debugTipsCount = parseInt(localStorage.debugTipsCount) + 1
            } , 3000)
        }

        localStorage.createCache = JSON.stringify(this.createHistory)
        localStorage.selectCache = JSON.stringify(this.selectHistory)
        location.reload()
    }

    initEvent(): void {
        cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_MOVE , this.touchMove , this)
        cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_END , this.touchEnd , this)
        cc.Canvas.instance.node.on(cc.Node.EventType.TOUCH_CANCEL , this.touchEnd , this)
    }

    initCache(): void {
        try {
            this.createHistory = JSON.parse(localStorage.createCache)
            const selectHistory = JSON.parse(localStorage.selectCache)

            if (selectHistory.length >= 2) {
                this.message('自动播放开始\n按"重新开始"可以退出debug模式继续游玩')
                let autoPlayTimeout = null
                const autoSelect = () => {
                    if (!this.checking) {
                        if (selectHistory.length === 0) {
                            this.message('自动播放结束!')
                            clearTimeout(autoPlayTimeout)
                            return
                        }

                        const selectValue = selectHistory.shift()

                        this.select(this.list[selectValue])
                    }

                    autoPlayTimeout = setTimeout(autoSelect , 500)
                }

                autoPlayTimeout = setTimeout(autoSelect , 1000)
            }
        } catch (err) {
            console.log('initCache error => ' , err)
        }
    }

    initView(): void {
        const blocks = [
            '0,0' ,
            '0,1' ,
            '0,2' ,
            '1,0' ,
            '1,1' ,
            '2,0' ,

            '4,5' ,
            '5,5' ,

            '0,9' ,
            '0,8' ,
            '0,7' ,
            '1,9' ,
            '1,8' ,
            '2,9' ,

            '7,9' ,
            '8,9' ,
            '9,9' ,
            '8,8' ,
            '9,8' ,
            '9,7' ,

            '7,0' ,
            '8,0' ,
            '9,0' ,
            '8,1' ,
            '9,1' ,
            '9,2'
        ]

        this.list = new Array(this.line * this.column).fill(null).map((_ , index) => {
            const box = this.createBox(blocks.indexOf(index % 10 + ',' + Math.floor(index / 10)) !== -1 ? -1 : null)

            this.node.addChild(box.node)
            return box
        })
    }

    initMessage(): void {
        const node = new cc.Node('MessageComponent')
        const label = node.addComponent(cc.Label)

        label.fontSize = 30
        label.lineHeight = 0
        node.setPosition(0 , 500)
        this.node.parent.addChild(node)
        this.messageComponent = label
    }

    initScore(): void {
        const node = new cc.Node('Score')
        const label = node.addComponent(cc.Label)

        label.fontSize = 30
        label.lineHeight = 0

        node.setPosition(280 , 550)
        // @ts-ignore
        node.color = cc.color('ffff00')

        this.node.parent.addChild(node)
        this.scoreComponent = label
        this.score = 0
    }

    start(): void {
        window['m'] = this

        this.initMessage()
        this.initScore()
        this.initEvent()
        this.initCache()
        this.initView()

        this.check(this.list)
    }

    touchStart(e: cc.Event.EventTouch): void {
        if (this.checking) {
            return
        }

        const touchStartBox = this.list.find((box) => {
            return box.node === e.target
        })

        if (touchStartBox.type < 1) {
            return
        }

        const selectBox = this.list.find((box) => {
            return box.node === e.target
        })

        this.select(selectBox)

        this.touchTarget = e.target
        this.touchStartPosition = cc.v2(e.getLocationX() , e.getLocationY())
    }

    touchMove(e: cc.Event.EventTouch): void {
        if (this.touchTarget === null || this.checking) {
            return
        }

        const touchMoveDiff = cc.v2(e.getLocationX() - this.touchStartPosition.x , e.getLocationY() - this.touchStartPosition.y)

        if (this.firstDirection === '') {
            if (Math.abs(touchMoveDiff.x) > 5 || Math.abs(touchMoveDiff.y) > 5) {
                this.firstDirection = getDirection(touchMoveDiff.x , touchMoveDiff.y)
                this.lastViewDirection = this.firstDirection
                this.viewDirection = this.firstDirection
            } else {
                return
            }
        }

        this.viewDirection = getViewDirection(this.firstDirection , this.lastViewDirection , getDirection(touchMoveDiff.x , touchMoveDiff.y))
        this.lastViewDirection = this.viewDirection


        const boxA = this.list.find((box) => {
            return box.node === this.touchTarget
        })
        let xPlus = 0
        let yPlus = 0

        switch (this.viewDirection) {
            case 'up':
                yPlus++
                break
            case 'down':
                yPlus--
                break
            case 'left':
                xPlus--
                break
            case 'right':
                xPlus++
                break
        }


        const boxB = this.getBox(boxA.x + xPlus , boxA.y + yPlus)

        if (boxB === null || boxB.type < 1) {
            return
        }

        this.touchEnd()
        this.select(boxA)
        this.select(boxB)
    }

    touchEnd(): void {
        if (this.touchTarget === null) {
            return
        }
        this.touchTarget = null
        this.firstDirection = ''
        this.viewDirection = ''
        this.lastViewDirection = ''
    }
}





function getViewDirection(firstDirection: string , lastViewDirection: string , nowDirection: string) {
    let viewDirection = ''

    if (firstDirection === 'up' || firstDirection === 'down') {
        if (nowDirection === 'left' || nowDirection === 'right') {
            viewDirection = lastViewDirection
        } else {
            viewDirection = nowDirection === 'up' ? 'up' : 'down'
        }
    }

    if (firstDirection === 'left' || firstDirection === 'right') {
        if (nowDirection === 'up' || nowDirection === 'down') {
            viewDirection = lastViewDirection
        } else {
            viewDirection = nowDirection === 'left' ? 'left' : 'right'
        }
    }

    return viewDirection
}

function getDirection(x: number , y: number) {

    const angle = Util.posttionToAngle(x , y)

    if (angle >= 360 - 45 || angle <= 45) {
        return 'up'
    }
    if (angle >= 360 - 45 - 90) {
        return 'left'
    }
    if (angle >= 360 - 45 - 90 - 90) {
        return 'down'
    }
    if (angle >= 45) {
        return 'right'
    }
}