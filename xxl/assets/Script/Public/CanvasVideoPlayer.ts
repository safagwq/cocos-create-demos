const { ccclass , menu } = cc._decorator

@ccclass
@menu('通用组件/视频播放器')
export default class CanvasVideoPlayer extends cc.Component {
    private sprite: cc.Sprite = null
    private ctx: CanvasRenderingContext2D = null
    private canvasVideo: HTMLCanvasElement = null
    private player: HTMLVideoElement = null
    private endedEvent: ()=>void
    private canPlayEvent: ()=>void
    private canPlay = false

    url = ''

    update():void {
        this.ctx.drawImage(this.player , 0 , 0)
    }

    start() :void{
        // @ts-ignore
        // window.v = this
        if (this.player === null) {
            this.init()
        }

        if (this.url) {
            this.player.src = this.url
            this.player.load()
        }
    }

    private init():void {
        this.player = document.createElement('video')

        this.player['playsInline'] = true

        this.player.setAttribute('x5-video-player-type' , 'h5')
        this.player.setAttribute('x5-video-player-fullscreen' , 'true')
        this.player.setAttribute('x5-playsinline' , 'true')
        this.player.setAttribute('webkit-playsinline' , 'true')
        this.player.setAttribute('playsInline' , 'true')

        this.player.controls = false
        this.player.preload = 'auto'
        this.canvasVideo = document.createElement('canvas')
        this.ctx = this.canvasVideo.getContext('2d')
        this.player.style.opacity = '0'
        this.player.style.height = '0'
        this.player.style.width = '0'
        this.player.style.position = 'absolute'
        this.player.style.pointerEvents = 'none'
        this.player.style['-webkit-pointer-events'] = 'none'
        document.body.appendChild(this.player)

        this.sprite = this.node.getComponent(cc.Sprite)
        this.player.oncanplay = () => {
            this.canvasVideo.height = this.player.videoHeight
            this.canvasVideo.width = this.player.videoWidth

            const videoTexture = new cc.Texture2D()

            videoTexture.initWithElement(this.canvasVideo)
            const videoSpriteFrame = new cc.SpriteFrame(videoTexture)

            this.sprite.spriteFrame = videoSpriteFrame

            if(this.canPlayEvent){
                this.canPlayEvent()
            }
        }

        this.player.onended = () => {
            if(this.endedEvent){
                this.endedEvent()
            }
        }
    }

    /**
     * 设置视频播放完成后的回调事件
     * @param callback
     */
    setEndCallback(callback: ()=>void):void {
        this.endedEvent = callback
    }

    setCanPlay(callback: ()=>void):void {
        this.canPlayEvent = callback
    }

    // private isWebglModel(): boolean {
    //     // @ts-ignore
    //     return cc._renderType === cc.game.RENDER_TYPE_WEBGL
    // }

    /**
     * 设置视频播放路径 , 支持http连接和base64链接(以 "data:video/mp4;base64," 开头)
     * @param url
     */
    setUrl(url: string):void {
        if(this.player){
            this.player.pause()
        }
        this.url = url
        this.start()
    }

    play():void {
        this.player.play()
    }
    paused():boolean {
        if (this.player === null) {
            return true
        }
        return this.player.paused
    }
    pause() :void{
        this.player.pause()
    }
    toggle():void{
        if (this.player.paused) {
            this.play()
        } else {
            this.pause()
        }
    }
    stop():void {
        this.currentTime = this.player.duration
        this.player.pause()
    }
    onDestroy():void {
        document.body.removeChild(this.player)
    }
    replay():void {
        this.currentTime = 0
        this.play()
    }
    height(): number {
        return this.player.videoHeight
    }
    width(): number {
        return this.player.videoWidth
    }

    get loop():boolean {
        return this.player.loop
    }
    set loop(value:boolean) {
        this.player.loop = value
    }

    get volume():number {
        return this.player.volume
    }
    set volume(value:number) {
        this.player.volume = value
    }

    /**
     * 播放速率
     */
    get playbackRate():number {
        return this.player.playbackRate
    }
    set playbackRate(value:number) {
        this.player.playbackRate = value
    }

    /**
     * 播放进度
     */
    get currentTime():number {
        return this.player.currentTime
    }
    set currentTime(value:number) {
        this.player.currentTime = value
    }
}
