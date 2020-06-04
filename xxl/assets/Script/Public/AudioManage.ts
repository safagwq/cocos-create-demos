const { ccclass, property, menu } = cc._decorator

@ccclass
@menu('通用组件/音频管理器')
export default class AudioManage extends cc.Component {
    private nowBgm = null
    @property(cc.AudioClip) bgm: cc.AudioClip = null
    @property(cc.AudioClip) win: cc.AudioClip = null
    @property(cc.AudioClip) lost: cc.AudioClip = null
    @property(cc.AudioClip) click: cc.AudioClip = null

    bgmPlaying = false





    start(): void {
        this.playBgm()

        const playBgmCallback = () => {
            if (this.bgmPlaying) {
                return
            }

            this.bgmPlaying = true
            this.playBgm()

            cc.Canvas.instance.node.off('touchstart', playBgmCallback)

            cc.Canvas.instance.node.getComponents(cc.Button).forEach((button) => {
                button.node.off('touchstart', playBgmCallback)
            })
        }

        cc.Canvas.instance.node.once('touchstart', playBgmCallback)
        cc.Canvas.instance.node.getComponentsInChildren(cc.Button).forEach((button) => {
            button.node.once('touchstart', playBgmCallback)
        })
    }

    /**
     * 播放指定的bgm或者默认bgm(同一个bgm重复调用并不会重复播放)
     * @param name
     */
    playBgm(name?: string): void {
        this.nowBgm = name || this.bgm
        AudioManage.playBgm(this.nowBgm)
    }

    /**
     * 停止播放当前bgm
     * @param name
     */
    stopBgm(): void {
        AudioManage.stopAudio(this.nowBgm)
    }

    /**
     * 恢复播放当前的bgm
     */
    resumeBgm(): void {
        AudioManage.resumeAudio(this.nowBgm)
    }

    /**
     * 暂停播放当前的bgm
     */
    pauseBgm(): void {
        AudioManage.pauseAudio(this.nowBgm)
    }

    /**
     * 停止播放一个指定的音效
     * @param name
     */
    stop(name: any): void {
        AudioManage.stopAudio(this[name])
    }

    /**
     * 播放一个指定的音效
     * @param name
     */
    play(name: string): void {
        AudioManage.playAudio(this[name])
    }


    private static audioIds = {}
    private static audioIdsTimeouts = {}



    /**
     * 播放一个指定路径的音效
     * @param src
     * @param volume
     */
    static playAudio(src: any, volume = 1): void {
        if (!src) {
            return
        }

        // (防抖动)33毫秒内只播放一次相同的音频
        if (src in AudioManage.audioIdsTimeouts && AudioManage.audioIdsTimeouts[src] + 33 > Date.now()) {
            return
        }

        AudioManage.audioIdsTimeouts[src] = Date.now()
        AudioManage.audioIds[src] = cc.audioEngine.play(src, false, volume)
    }

    /**
     * 播放一个指定路径的bgm
     * @param src
     * @param volume
     */
    static playBgm(src: any, volume = 1): void {
        if (!src) {
            return
        }

        if (src in AudioManage.audioIds) {
            if (cc.audioEngine.getState(AudioManage.audioIds[src]) !== cc.audioEngine.AudioState.PLAYING) {
                cc.audioEngine.resume(AudioManage.audioIds[src])
            }
            return
        }

        AudioManage.audioIds[src] = cc.audioEngine.play(src, true, volume)
    }

    /**
     * 恢复一个指定路径的音效
     * @param src
     */
    static resumeAudio(src: any): void {
        if (!src) {
            return
        }

        if (src in AudioManage.audioIds) {
            cc.audioEngine.resume(AudioManage.audioIds[src])
        }
    }

    /**
     * 暂停一个指定路径的音效
     * @param src
     */
    static pauseAudio(src: any): void {
        if (!src) {
            return
        }
        if (src in AudioManage.audioIds) {
            cc.audioEngine.pause(AudioManage.audioIds[src])
        }
    }

    /**
     * 停止一个指定路径的音效
     * @param src
     */
    static stopAudio(src: any): void {
        if (!src) {
            return
        }
        if (src in AudioManage.audioIds) {
            cc.audioEngine.stop(AudioManage.audioIds[src])
            delete AudioManage.audioIds[src]
            // audioIds[src] = null
        }
    }

}





