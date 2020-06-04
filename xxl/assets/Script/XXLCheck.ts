import Util from './Public/Util'

var _grid = null
var _column = 0


export interface Box {
    id: number
    x: number
    y: number
    type: number
    color: string
    node: cc.Node
    checked: boolean
    selected: boolean
}

export function xxlCheck(list: Box[] , line: number , column: number , checkList: Box[]):Box[]{
    setData(list , line , column)
    const clearList = quickCheck(checkList)

    if (clearList.length < 3) {
        return null
    }

    return quickCheck(checkList)


}

export function getUpdateColumn(unionList: Box[]): Box[][] {
    const updateColumnList = []

    unionList.forEach((box) => {
        if (!updateColumnList[box.x]) {
            updateColumnList[box.x] = []
        }

        updateColumnList[box.x].push(box)
    })

    updateColumnList.forEach((list) => {
        if (list) {
            list.sort((a , b) => {
                return a.y - b.y
            })
        }
    })

    return updateColumnList.filter((list) => list)
}

export function getUpdateUnionList(list: Box[]): Box[] {
    return Util.getUnion(
        ...list.map((box) => {
            const inUpBoxList = []

            for (let y = box.y; y < _column; y++) {
                inUpBoxList.push(getBox(box.x , y))
            }
            return inUpBoxList
        })
    )
}


function setData(list: Box[] , line: number , column: number) {
    _grid = Util.splitByLength(list , line)
    _column = column
}

function quickCheck(checkList: Box[]): Box[] {
    const resultList = []

    checkList
    .map((box) => {

        if (box.type < 1) {
            return null
        }

        return getQuickCheckChain(box)
    })
    .forEach((result) => {
        if (result === null) {
            return
        }

        if (result.lineChains) {
            resultList.push(result.lineChains)
        }
        if (result.columnChains) {
            resultList.push(result.columnChains)
        }
    })

    return Util.getUnion(...resultList)
}

function getQuickCheckChain(centerbox: Box) {
    const chains = getQuickCheckAround(centerbox)
    let lineChains = [centerbox]
    let columnChains = [centerbox]

    Object.keys(chains).map((chainName) => {
        const chain = chains[chainName]

        if (chain.every((box) => box)) {
            // @ts-ignore
            chain.push(...getChainByDirection(chain[1] , chainName))
        }
    })

    chains.left.every((box) => {
        if (box) {
            lineChains.unshift(box)
            return true
        }
        return false
    })

    chains.right.every((box) => {
        if (box) {
            lineChains.push(box)
            return true
        }
        return false
    })

    chains.up.every((box) => {
        if (box) {
            columnChains.unshift(box)
            return true
        }
        return false
    })

    chains.down.every((box) => {
        if (box) {
            columnChains.push(box)
            return true
        }
        return false
    })

    if (lineChains.length < 3) {
        lineChains = null
    }
    if (columnChains.length < 3) {
        columnChains = null
    }

    return { lineChains , columnChains }
}

function getChainByDirection(box: Box , direction: 'up' | 'down' | 'left' | 'right') {
    const chain = []
    let _box = box

    while (true) {
        let targetBox = getAroundByDirection(_box , direction)

        if (targetBox && targetBox.type === box.type) {
            chain.push(targetBox)
            _box = targetBox
        } else {
            break
        }
    }

    return chain
}

function getAroundByDirection(box: Box , direction: 'up' | 'down' | 'left' | 'right'): Box {
    const { x , y } = box

    switch (direction) {
        case 'up':
            return getBox(x , y + 1)
        case 'down':
            return getBox(x , y - 1)
        case 'left':
            return getBox(x - 1 , y)
        case 'right':
            return getBox(x + 1 , y)
    }
}

function getBox(x: number , y: number): Box {
    return _grid[y] && _grid[y][x] || null
}

function getQuickCheckAround(box: Box) {
    const { x , y } = box
    const up = getBox(x , y + 1)
    const up_2 = getBox(x , y + 2)
    const down = getBox(x , y - 1)
    const down_2 = getBox(x , y - 2)
    const left = getBox(x - 1 , y)
    const left_2 = getBox(x - 2 , y)
    const right = getBox(x + 1 , y)
    const right_2 = getBox(x + 2 , y)

    const mapResult = [up , up_2 , down , down_2 , left , left_2 , right , right_2].map((_box) => {
        if (_box && _box.type === box.type) {
            return _box
        }
        return null
    })

    return {
        'up' : [mapResult[0] , mapResult[1]] ,
        'down' : [mapResult[2] , mapResult[3]] ,
        'left' : [mapResult[4] , mapResult[5]] ,
        'right' : [mapResult[6] , mapResult[7]]
    }
}