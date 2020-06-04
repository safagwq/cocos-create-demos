const { ccclass } = cc._decorator

interface AnimeProps {
    x?: number | string
    y?: number | string
    scale?: number | string
    scaleX?: number | string
    scaleY?: number | string
    skewX?: number | string
    skewY?: number | string
    rotation?: number | string
    color?: string | [number , number , number] | [number , number , number , number]
    opacity?: number | string
    width?: number | string
    height?: number | string
    data?: any
    callback?(status: {
        progress: number
        easingProgress: number
        data: any
        animeLine: AnimeLine
    }): void
    easingType?: { easing(time: number): number } | 'linear' // | 'easeIn' | 'easeIn3' | 'easeOut' | 'easeOut3' | 'easeInOut' | 'easeInOut3'
}


type AnimeLineCallback = (animeLine:AnimeLine , data:any)=>void|AnimeLine|Promise<null>

interface Anime {
    props?: AnimeProps | AnimeProps[]
    callback?: AnimeLineCallback
    time: number
    values?: any[]
}


export class AnimeLine {

    private node: cc.Node = null
    private time = 0
    private animeList: Anime[] = []
    private animeOtherData = null
    private animeIndex = 0
    private animeRepeatCount = 1
    private endCallback: ()=>void
    private endCallbackResolve: ()=>void
    private isUse60Fps = false
    private canReverse = 'false'
    isReverse = false
    status = ''



    constructor(node?: cc.Node) {
        this.node = node
        AnimeLine.list.push(this)
    }

    anime( time: AnimeLineCallback | AnimeProps | AnimeProps[] | number = 0 , props?: AnimeProps | AnimeProps[]):AnimeLine {
        if (typeof time === 'function') {
            return this.callback(time)
        }

        const anime : Anime = {
            'time' : 0
        }

        if (typeof time === 'object') {
            anime.props = time
        } else{
            anime.props = props
            anime.time = time
        }

        if (time || props) {
            this.animeList.push(anime)
        }

        return this
    }

    // use60FpsModel() {
    //     this.isUse60Fps = true
    //     return this
    // }

    callback(callback: AnimeLineCallback):AnimeLine {
        this.animeList.push({ 'time' : 0 , callback })
        return this
    }

    show():AnimeLine {
        return this.callback(() => {
            this.node.active = true
        })
    }
    hide():AnimeLine {
        return this.callback(() => {
            this.node.active = false
        })
    }

    destroy():AnimeLine {
        return this.callback(() => {
            this.node.destroy()
        })
    }

    pause():void {
        this.status = 'pause'
    }

    play():void {
        this.status = 'runing'
    }

    stop():void {
        this.isReverse = false
        this.animeIndex = 0
        this.time = 0
        this.status = 'end'

        if(this.endCallback){
            this.endCallback()
        }
        if(this.endCallbackResolve){
            this.endCallbackResolve()
        }
    }

    run():AnimeLine {
        this.isReverse = false
        this.status = 'runing'
        this.animeIndex = 0
        this.time = 0
        this.updateAnimeList()
        return this
    }

    private runReverse():AnimeLine {
        this.isReverse = true
        this.status = 'runing'
        this.animeIndex = this.animeList.length - 1
        this.time = this.animeList[this.animeIndex].time
        this.updateAnimeList()
        return this
    }

    end(callback?:()=>void):Promise<null> {
        this.endCallback = callback
        return new Promise<null>((resolve) => {
            this.endCallbackResolve = resolve
        })
    }

    repeat(repeatCount = Infinity):AnimeLine {
        this.animeRepeatCount = repeatCount
        return this
    }

    reverse() :AnimeLine{
        this.canReverse = 'true'
        return this
    }

    update(dt: number):void {
        if (this.status === 'runing') {
            // if (this.canReverse === 'forever') {
            //     this.time += -dt
            //     this.updateAnimeList()
            //     return
            // }

            this.time += (this.isReverse ? -1 : 1) * dt
            this.updateAnimeList()
        }
    }

    private parseAnime(anime: Anime) :Anime {

        if (anime.values || anime.callback) {
            return anime
        }

        const values = []
        const propsList = Array.isArray(anime.props) ? anime.props : [anime.props]

        propsList.forEach((props) => {
            if(!props){
                return
            }

            Object.keys(props).forEach((name) => {
                const easingType = props.easingType || 'linear'

                if (name === 'callback') {
                    values.push({ name , easingType , 'callback' : props.callback })
                    return
                }

                if (name === 'data') {

                    if (this.animeOtherData === null) {
                        this.animeOtherData = {}
                    }

                    const dataValues = {}

                    for (let name in props.data) {
                        if (name in this.animeOtherData) {
                            const start = this.animeOtherData[name]
                            const diff = AnimeLine.getNumberDiff(props.data[name] , start)

                            dataValues[name] = {
                                'value' : start + diff ,
                                name ,
                                start ,
                                diff
                            }
                        } else {
                            dataValues[name] = {
                                'value' : props.data[name] ,
                                name ,
                                'start' : null ,
                                'diff' : null
                            }

                            this.animeOtherData[name] = props.data[name]
                        }
                    }

                    values.push({ name , easingType , dataValues })
                    return
                }


                if (name === 'color') {
                    const start = {
                        'r' : this.node.color.getR() ,
                        'g' : this.node.color.getG() ,
                        'b' : this.node.color.getB() ,
                        'a' : this.node.color.getA()
                    }

                    const end = AnimeLine.porseColor(props.color)

                    const diff = AnimeLine.getColorDiff(end , start)

                    values.push({ name , diff , start , easingType })
                    return
                }

                const start = this.node[name]
                const diff = AnimeLine.getNumberDiff(props[name] , start)

                values.push({ name , diff , start , easingType })

            })
        })

        anime.values = values

        return anime
    }


    private animeListIsEnd(): boolean {
        if (this.isReverse === false && this.animeIndex + 1 > this.animeList.length || this.isReverse === true && this.animeIndex === -1) {

            if (this.isReverse === false && this.canReverse === 'true') {
                this.runReverse()
                return
            }

            this.animeRepeatCount--

            if (this.animeRepeatCount > 0) {
                this.run()
            } else {
                this.stop()
            }
            return true
        }
        return false
    }

    private animeIsCallback(anime: Anime): boolean {
        if (typeof anime.callback === 'function') {
            let callbackReturn = anime.callback(this , this.animeOtherData)

            if (callbackReturn instanceof AnimeLine) {
                callbackReturn = callbackReturn.end()
            }
            if (callbackReturn instanceof Promise) {

                callbackReturn.then(() => {
                    if (this.isReverse) {
                        this.animeIndex--
                        this.time += this.animeList[this.animeIndex].time
                    } else {
                        this.animeIndex++
                    }

                    this.status = 'runing'
                    this.updateAnimeList()
                })
                this.status = 'wait'
                return true
            }

            if (this.isReverse) {
                this.animeIndex--
                this.time += this.animeList[this.animeIndex].time
            } else {
                this.animeIndex++
            }
            this.updateAnimeList()
            return true
        }
        return false
    }

    private updateTime(anime: Anime) {

        if (this.isReverse === false && this.time >= anime.time) {
            this.animeIndex++
            this.time -= anime.time
            this.updateAnimeList()
        } else if (this.isReverse === true && this.time <= 0) {
            this.animeIndex--
            if (this.animeIndex >= 0) {
                this.time += this.animeList[this.animeIndex].time
            } else {
                this.time = -this.time
            }
            this.updateAnimeList()
        }
    }

    private updateAnimeList() {

        if (this.animeListIsEnd()) {
            return
        }

        const anime = this.parseAnime(this.animeList[this.animeIndex])

        if (this.animeIsCallback(anime)) {
            return
        }

        let progress = 0

        if (anime.time === 0) {
            progress = this.isReverse ? 0 : 1
        } else if (this.time >= anime.time) {
            progress = 1
        } else if (this.time < 0) {
            progress = 0
        } else {
            progress = this.time / anime.time
        }


        anime.values.forEach((valueItem) => {
            const easingFn = AnimeLine.getEasingFn(valueItem.easingType)
            const easingProgress = easingFn.call(valueItem.easingType , progress)

            switch (valueItem.name) {
                case 'data':
                    Object.keys(valueItem.dataValues).forEach((dataValueName) => {
                        const dataValue = valueItem.dataValues[dataValueName]

                        if (dataValue.start !== null) {
                            this.animeOtherData[dataValueName] = dataValue.start + easingProgress * dataValue.diff
                        } else {
                            this.animeOtherData[dataValueName] = dataValue.value
                        }
                    })
                    break
                case 'callback':
                    valueItem.callback({
                        progress ,
                        easingProgress ,
                        'data' : this.animeOtherData ,
                        'animeLine' : this
                    })
                    break
                case 'color':
                    const r = valueItem.start.r + valueItem.diff.r * easingProgress
                    const g = valueItem.start.g + valueItem.diff.g * easingProgress
                    const b = valueItem.start.b + valueItem.diff.b * easingProgress
                    const a = valueItem.start.a + valueItem.diff.a * easingProgress

                    this.node.color = cc.color(r , g , b , a)
                    break
                default:
                    this.node[valueItem.name] = valueItem.start + valueItem.diff * easingProgress
            }

        })

        this.updateTime(anime)
    }

    private static list: AnimeLine[] = []

    private static lastTime = Date.now()

    private static getEasingFn(easingType: any): Function {
        if (typeof easingType === 'string') {
            return AnimeLine.animeTypes[easingType]
        } else if ('easing' in easingType) {
            return easingType.easing
        }

        return AnimeLine.animeTypes.linear
    }

    static updateList():void {

        requestAnimeFrame(AnimeLine.updateList)

        const nowTime = Date.now()
        // 如果出现卡顿或者页面进入后台计时器不更新的情况下 , 恢复回来后最多只进行6帧的动画
        const dt = Math.min(0.1 , (nowTime - AnimeLine.lastTime) / 1000)
        const autoClearAnimeLines = []


        AnimeLine.lastTime = nowTime
        AnimeLine.list.forEach((animeLine) => {

            animeLine.update(dt)

            if (animeLine.status === 'end') {
                autoClearAnimeLines.push(animeLine)
                return
            }
        })

        autoClearAnimeLines.forEach((animeLine) => {
            AnimeLine.list.splice(AnimeLine.list.indexOf(animeLine) , 1)
        })

    }


    private static animeTypes = {
        linear(bl: number) {
            return Number(bl) / 1
        }
    }


    private static getNumberDiff(value: any , startValue: number): number {
        if (typeof value === 'number') {
            return value - startValue
        }
        if (typeof value === 'string') {
            if (/^(\d|\+|\-)/.test(value)) {
                return parseFloat(value)
            }
            if (/^(\*)/.test(value)) {
                return startValue * parseFloat(value.slice(1)) - startValue
            }
            if (/^(\/)/.test(value)) {
                return startValue / parseFloat(value.slice(1)) - startValue
            }
        }
        return 0
    }

    private static getColorDiff(value: { r: number , g: number , b: number , a: number } , startValue: { r: number , g: number , b: number , a: number }): { r: number , g: number , b: number , a: number } {
        return {
            'r' : value.r - startValue.r ,
            'g' : value.g - startValue.g ,
            'b' : value.b - startValue.b ,
            'a' : value.a - startValue.a
        }
    }
    private static porseColor(color: string | number[] | { r: number , g: number , b: number , a?: number }): { r: number , g: number , b: number , a: number } {
        let _color = color

        if (typeof _color === 'string') {
            if (_color[0] === '#') {
                _color = _color.slice(1)
            }
            if (_color.length === 3) {
                _color += 'f'
            }
            if (_color.length === 4) {
                _color = _color[0] + _color[0] + _color[1] + _color[1] + _color[2] + _color[2] + _color[3] + _color[3]
            }

            if (_color.length === 6) {
                _color += 'ff'
            }
            if (_color.length === 8) {
                return {
                    'r' : parseInt('0x' + _color.slice(0 , 2)) ,
                    'g' : parseInt('0x' + _color.slice(2 , 4)) ,
                    'b' : parseInt('0x' + _color.slice(4 , 6)) ,
                    'a' : parseInt('0x' + _color.slice(6 , 8))
                }
            }
        } else if (Array.isArray(_color)) {
            const a = _color[3] || 255

            return {
                'r' : _color[0] ,
                'g' : _color[0] ,
                'b' : _color[0] ,
                a
            }
        } else {
            const { r , g , b , a } = _color

            return {
                r ,
                g ,
                b ,
                'a' : a || 255
            }
        }

    }
}


@ccclass
export default class FrameAnime extends cc.Component {
    anime(time: AnimeLineCallback | AnimeProps | AnimeProps[] | number = 0 , props?: AnimeProps | AnimeProps[]):AnimeLine {
        return new AnimeLine(this.node).anime(time , props)
    }
}



const requestAnimeFrame = window.requestAnimationFrame || function (callback: ()=>void) {
    setTimeout(callback , 1 / 60)
}

requestAnimeFrame(AnimeLine.updateList)
