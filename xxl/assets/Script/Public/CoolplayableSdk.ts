export default class CoolplayableSdk {
    private static _isEnd = false
    private static _isFirstTouch = false

    private static _nowSection = 0

    private static GotoAppStore() {
        try {
            Yeah.click()
        } catch (e) {
            cc.sys.openURL('')
            console.log('%c【CoolplayableSDK】GotoAppStore' , 'background: rgb(255, 0, 0); color: rgb(0, 0, 0)')
        }
    }

    /**
     * 游戏完成
     */
    public static GameEnd() {
        if (this._isEnd) {
            return
        }
        this._isEnd = true
        try {
            Yeah.end()
        } catch (e) {
            console.log('%c【CoolplayableSDK】GameEnd' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)')
        }
    }

    /**
     * 第一个有效交互行为，表示玩家确实进入游戏逻辑
     */
    public static FirstTouch() {
        if (this._isFirstTouch) {
            return
        }
        this._isFirstTouch = true
        try {
            Yeah.firstTouch()
        } catch (e) {
            console.log('%c【CoolplayableSDK】FirstTouch' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)')
        }
    }

    /**
     * 关卡切换时?
     */
    public static ClickContent(area: number) {
        try {
            Yeah.clickContent(this._nowSection , area)
        } catch (e) {
            console.log('%c【CoolplayableSDK】ClickContent:(section' + this._nowSection + ',area' + area + ')' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)')
        }
    }

    /**
     * 点击完成时?
     */
    public static ClickFinishContent(area: number) {
        try {
            Yeah.clickFinishContent(this._nowSection , area)
        } catch (e) {
            console.log('%c【CoolplayableSDK】ClickFinishContent:(section' + this._nowSection + ',area' + area + ')' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)')
        }
    }

    /**
     * 点击下载
     */
    public static ClickDownloadBar(area: number) {
        try {
            Yeah.clickDownloadBar(this._nowSection , area)
        } catch (e) {
            console.log('%c【CoolplayableSDK】ClickDownloadBar:(section' + this._nowSection + ',area' + area + ')' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)')
        }
        this.GotoAppStore()
    }

    /**
     * 点击下载完成时
     */
    public static ClickFinishDownloadBar(area: number) {
        try {
            Yeah.clickFinishDownloadBar(this._nowSection , area)
        } catch (e) {
            console.log('%c【CoolplayableSDK】ClickFinishDownloadBar:(section' + this._nowSection + ',area' + area + '))' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)')
        }
        this.GotoAppStore()
    }

    /**
     * 点击复活时
     */
    public static ClickReborn(area: number) {
        try {
            Yeah.clickReborn(this._nowSection , area)
        } catch (e) {
            console.log('%c【CoolplayableSDK】ClickReborn:(section' + this._nowSection + ',area' + area + ')' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)')
        }
        this._nowSection = 0
    }

    /**
     * 进入时
     */
    public static EnterSection(section: number) {
        if (section > this._nowSection) {
            this._nowSection = section
            try {
                Yeah.enterSection(section)
            } catch (e) {
                console.log('%c【CoolplayableSDK】EnterSection:(section' + this._nowSection + ')' , 'background: rgb(0, 255, 255); color: rgb(0, 0, 0)')
            }
        }
    }

    /**
     * 自动点击?
     */
    public static AutoClick() {
        try {
            Yeah.autoClick(this._nowSection)
        } catch (e) {
            console.log('%c【CoolplayableSDK】AutoClick:(section' + this._nowSection + ')' , 'background: rgb(248, 177, 173); color: rgb(63, 172, 203)' , 'background: rgb(255, 255, 0); color: rgb(0, 0, 0)')
        }
        this.GotoAppStore()
    }
}

declare namespace Yeah {
    function click()
    function end()

    //穿山甲追踪事件
    //第一个有效交互行为，表示玩家确实进入游戏逻辑
    function firstTouch()

    function clickContent(section: number , area: number)
    function clickFinishContent(section: number , area: number)
    function clickDownloadBar(section: number , area: number)
    function clickFinishDownloadBar(section: number , area: number)
    function clickReborn(section: number , area: number)

    function enterSection(section: number)
    function autoClick(section: number)
}
