const autoResizeLayerData = {
    'scale' : 1 ,
    'events' : [] ,
    'isFirstRun' : true
}

export default class Util {
    /**
     * scale : 当前Canvas的缩放比例(Fit Height)
     * isShow : 当前游戏是否可见(有可能用户打开了其他标签页或者锁屏)
     */
    static globalData = {
        'scale' : 1 ,
        'isShow' : true
    }



    /**
     * 设置屏幕尺寸变化时的回调函数 , 可以设置多个不冲突
     * @param callback
     */
    static setResizeCallback(callback: ()=>void ):void {
        if (autoResizeLayerData.isFirstRun) {
            autoResizeLayerData.isFirstRun = false

            cc.view.setResizeCallback(() => {
                autoResizeLayerData.events.forEach((callbackfn) => {
                    callbackfn()
                })
            })
        }

        autoResizeLayerData.events.push(callback)
    }


    /**
     * 清除一个屏幕尺寸变化时的回调函数
     * @param callback
     */
    static clearResizeCallback(callback: ()=>void):void {
        Util.removeItem(autoResizeLayerData.events , callback)
    }



    /**
     * 复制一个Json类型的纯数据
     * @param data
     */
    static cloneJsonData<T>(data: T) : T {
        return JSON.parse(JSON.stringify(data))
    }



    /**
     * 删除数组里的子项
     * @param arr
     * @param callback
     */
    static removeItem<T>(arr: T[] , item: T): boolean {
        const index = arr.indexOf(item)

        if (index !== -1) {
            arr.splice(index , 1)
            return true
        }
        return false
    }



    /**
     * 根据角度返回距离为 1 目标位置的 x , y 轴坐标
     * @param deg
     */
    static angleToPosttion(deg: number):{x:number , y:number} {
        let x = Math.sin(deg * (Math.PI / 180))
        let y = Math.cos(deg * (Math.PI / 180))

        if (deg === 0 || deg === 180) {
            x = 0
        }

        if (deg === 90 || deg === 270) {
            y = 0
        }

        return { x , y }
    }



    /**
     * 根据 x , y 相对距离返回角度
     * @param x :number | cc.Vec2
     * @param y :number
     */
    static posttionToAngle(x: number | cc.Vec2 , y: number): number {
        const radian = x instanceof cc.Vec2 ? Math.atan2(x.x , x.y) : Math.atan2(x , y)
        const deg = radian * 180 / Math.PI

        if (deg > 360) {
            return deg - 360
        }
        if (deg < 0) {
            return deg + 360
        }
        return deg
    }




    /**
     * 获取两个Node的锚点坐标距离
     * @param self
     * @param target
     */
    static getNodePositionDistance(self: cc.Node , target: cc.Node): number {
        const diff = Util.getNodePositionDiff(self , target)

        return Math.sqrt(diff.x * diff.x + diff.y * diff.y)
    }


    /**
     * 获取根据屏幕自动缩放过的两个Node的锚点坐标距离
     * @param self
     * @param target
     */
    static getNodePositionDistanceScaled(self: cc.Node , target: cc.Node): number {
        const diff = Util.getNodePositionDiffScaled(self , target)

        return Math.sqrt(diff.x * diff.x + diff.y * diff.y)
    }

    /**
     * 获取两个Node的锚点坐标差值
     * @param self
     * @param target
     */
    static getNodePositionDiff(self: cc.Node , target: cc.Node): cc.Vec2 {
        // @ts-ignore
        const { 'tx' : x1 , 'ty' : y1 } = self.getNodeToWorldTransformAR()
        // @ts-ignore
        const { 'tx' : x2 , 'ty' : y2 } = target.getNodeToWorldTransformAR()

        return cc.v2(x2 - x1 , y2 - y1)
    }


    /**
     * 获取根据屏幕自动缩放过的两个Node的锚点坐标差值
     * @param self
     * @param target
     */
    static getNodePositionDiffScaled(self: cc.Node , target: cc.Node): cc.Vec2 {
        const diff = Util.getNodePositionDiff(self , target)

        diff.mulSelf(1 / Util.globalData.scale)
        return diff
    }

    /**
     * 获取a到b之间的随机整数
     * @param a
     * @param b
     */
    static randomIntAtoB(a: number , b: number):number {
        return a + Math.floor(Math.random() * (b - a))
    }



    /**
     * 获取数组随机一个子项
     * @param arr
     */
    static getRandomItem<T>(arr: T[]): T {
        return arr[Math.floor(cc.random0To1() * arr.length)]
    }

    /**
     * 对数组随机排序并返回
     * @param arr
     */
    static arrayRandomSort<T>(arr: T[]): T[] {
        arr.sort(() => Math.random() - 0.5)
        return arr
    }

    /**
     * 归并一个二维数组
     * @param arrList
     */
    static getUnion<T>(...arrList: T[][]): T[] {
        const initArr = arrList[0] || []
        const otherArr = arrList.slice(1)
        const unionSet = new Set(initArr)

        otherArr.forEach((arr) => {
            arr.forEach((item) => unionSet.add(item))
        })

        return Array.from(unionSet)
    }


    /**
     * 把一个一维数组按照指定长度分割为二维数组
     * @param arr
     * @param length
     */
    static splitByLength<T>(arr: T[] , length: number): T[][] {
        var newArr = []

        for (let i = 0; i < arr.length; i += length) {
            newArr.push([...arr.slice(i , i + length)])
        }
        return newArr
    }


    /**
     * 从当前节点/组件开始往下查找一个指定名称的Node
     * @param self 当前节点或者当前组件
     * @param name
     */
    static getNodeInChildrenByName(self: cc.Node | cc.Component , name: string): cc.Node {
        if (self instanceof cc.Node) {
            for (let i = 0; i < self.children.length; i++) {
                if (self.children[i].name === name) {
                    return self.children[i]
                }
                let childrenTarget = Util.getNodeInChildrenByName(self.children[i] , name)

                if (childrenTarget !== null) {
                    return childrenTarget
                }

            }
            return null
        }

        if (self instanceof cc.Component) {
            return Util.getNodeInChildrenByName(self.node , name)
        }

        return null
    }


    /**
 * 从Canvas开始往下查找一个指定名称的Node
 * @param name
 */
    static getNodeInCanvasByName(name: string):cc.Node {
        return Util.getNodeInChildrenByName(cc.Canvas.instance.node , name)
    }
    /**
     * 从Canvas开始往下查找一个组件
     * @param type
     */
    static getComponentInCanvas<T extends cc.Component>(type: { prototype: T }): T {
        return cc.Canvas.instance.node.getComponent(type) || cc.Canvas.instance.node.getComponentInChildren(type)
    }

    /**
     * 从父节点开始往上查找一个组件
     * @param type
     */
    static getComponentInParents<T extends cc.Component>(self: cc.Node | cc.Component , type: { prototype: T }): T {
        let targetNode: cc.Node = self instanceof cc.Node ? self : self.node
        let targetComponent: T = null

        while (targetNode) {
            targetComponent = targetNode.parent.getComponent(type)
            if (targetComponent !== null) {
                return targetComponent
            }
            targetNode = targetNode.parent
        }
        return null
    }


}
