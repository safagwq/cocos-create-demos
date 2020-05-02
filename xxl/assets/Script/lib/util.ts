var _grid = null
var _line = 0
var _column = 0

export function cloneJsonData(data) {
    return JSON.parse(JSON.stringify(data))
}

export function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

export function getUnion<T>(...arrList: T[][]): T[] {
    const initArr = arrList[0] || []
    const otherArr = arrList.slice(1)
    const unionSet = new Set(initArr)

    otherArr.forEach((arr) => {
        arr.forEach((item) => unionSet.add(item))
    })

    return Array.from(unionSet)
}

// export function getIntersection(arr, ...otherArr) {
//     const countMap = new Map()
//     const count = otherArr.length + 1
//     arr.forEach((item) => {
//         countMap.set(item, 1)
//     })

//     otherArr.forEach((arr) => {
//         arr.forEach((item) => {
//             countMap.set(item, (countMap.get(item) || 0) + 1)
//         })
//     })

//     return Array.from(countMap).filter((item) => countMap.get(item) == count)
// }

export function splitByLength<T>(arr: T[], length: number): T[][] {
    var newArr = []
    for (var i = 0; i < arr.length; i += length) {
        newArr.push([...arr.slice(i, i + length)])
    }
    return newArr
}

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

interface xxlCheckInterface {
    getQuickCheckAround(
        box: Box,
    ): {
        up: Box[]
        down: Box[]
        left: Box[]
        right: Box[]
    }

    getBox(x: number, y: number): Box

    getChainByDirection(box: Box, direction: 'up' | 'down' | 'left' | 'right'): Box[]

    getQuickCheckChain(
        box: Box,
    ): {
        lineChains: Box[]
        columnChains: Box[]
    }

    quickCheck(checkList: Box[]): Box[]

    getUpdateColumn(clearList: Box[]): Box[]
    getUpdateUnionList(unionList: Box[]): Box[][]

    (list: Box[], line: number, checkList: Box[]): null | {
        clearList: Box[]
        unionList: Box[]
        updateColumnList: Box[][]
    }
}

export const xxlCheck = function (list: Box[], line: number, column: number, checkList: Box[]) {
    xxlCheck.setData(list, line, column)

    const clearList = xxlCheck.quickCheck(checkList)

    if (clearList.length < 3) {
        return null
    }

    const unionList = xxlCheck.getUpdateUnionList(clearList)
    const updateColumnList = xxlCheck.getUpdateColumn(unionList)

    return {
        clearList,
        unionList,
        updateColumnList,
    }
}

// @ts-ignore
window.xxlCheck = xxlCheck

xxlCheck.setData = function (list: Box[], line: number, column: number) {
    _grid = splitByLength(list, line)
    _line = line
    _column = column
}

xxlCheck.quickCheck = function (checkList: Box[]): Box[] {
    const resultList = []

    checkList
        .map((box) => {
            return this.getQuickCheckChain(box)
        })
        .forEach((result) => {
            // console.log(result.columnChains, checkList)

            if (result.lineChains) {
                resultList.push(result.lineChains)
            }
            if (result.columnChains) {
                resultList.push(result.columnChains)
            }
        })

    return getUnion(...resultList)
}

xxlCheck.getUpdateColumn = function (unionList: Box[]): Box[][] {
    const updateColumnList = []

    unionList.forEach((box) => {
        if (!updateColumnList[box.x]) {
            updateColumnList[box.x] = []
        }

        updateColumnList[box.x].push(box)
    })

    updateColumnList.forEach((list) => {
        if (list) {
            list.sort((a, b) => {
                return a.y - b.y
            })
        }
    })

    return updateColumnList.filter((list) => list)
}

xxlCheck.getUpdateUnionList = function (list: Box[]): Box[] {
    return getUnion(
        ...list.map((box) => {
            const inUpBoxList = []
            for (let y = box.y; y < _column; y++) {
                inUpBoxList.push(this.getBox(box.x, y))
            }
            return inUpBoxList
        }),
    )
}

xxlCheck.getQuickCheckChain = function (box: Box) {
    const chains = this.getQuickCheckAround(box)
    let lineChains = [box]
    let columnChains = [box]

    Object.keys(chains).map((chainName) => {
        const chain = chains[chainName]
        if (chain.every((box) => box)) {
            chain.push(...this.getChainByDirection(chain[1], chainName))
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

    return { lineChains, columnChains }
}

xxlCheck.getChainByDirection = function (box: Box, direction: 'up' | 'down' | 'left' | 'right') {
    const chain = []
    let _box = box

    while (true) {
        let targetBox = this.getAroundByDirection(_box, direction)
        if (targetBox && targetBox.type == box.type) {
            chain.push(targetBox)
            _box = targetBox
        } else {
            break
        }
    }

    return chain
}

xxlCheck.getAroundByDirection = function (box: Box, direction: 'up' | 'down' | 'left' | 'right') {
    const { x, y } = box

    switch (direction) {
        case 'up':
            return this.getBox(x, y + 1)
        case 'down':
            return this.getBox(x, y - 1)
        case 'left':
            return this.getBox(x - 1, y)
        case 'right':
            return this.getBox(x + 1, y)
    }

    return null
}

xxlCheck.getBox = function (x: number, y: number) {
    return (_grid[y] && _grid[y][x]) || null
}

xxlCheck.getQuickCheckAround = function (box: Box) {
    const { x, y } = box
    const up = this.getBox(x, y + 1)
    const up_2 = this.getBox(x, y + 2)
    const down = this.getBox(x, y - 1)
    const down_2 = this.getBox(x, y - 2)
    const left = this.getBox(x - 1, y)
    const left_2 = this.getBox(x - 2, y)
    const right = this.getBox(x + 1, y)
    const right_2 = this.getBox(x + 2, y)

    const mapResult = [up, up_2, down, down_2, left, left_2, right, right_2].map((_box) => {
        if (_box && _box.type == box.type) {
            return _box
        }
        return null
    })

    return {
        up: [mapResult[0], mapResult[1]],
        down: [mapResult[2], mapResult[3]],
        left: [mapResult[4], mapResult[5]],
        right: [mapResult[6], mapResult[7]],
    }
}
