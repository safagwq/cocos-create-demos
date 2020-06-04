import CoolplayableSdk from './CoolplayableSdk'

const { ccclass , property , menu } = cc._decorator


@ccclass('ViewEventOptions')
class ViewEventOptions {
    @property({
        'displayName' : '界面显示顺序'
    })
    EnterSectionValue = 0

    @property({
        'displayName' : '是否结束界面'
    })
    GameEnd = false
}

@ccclass('ClickEventOptions')
class ClickEventOptions {
    @property({
        'type' : cc.Enum(ClickEventOptions.Types) ,
        'displayName' : '点击类型' ,
        'tooltip' : 'FinishDownload : 游戏完成后下载 \n Download : 游戏中下载 \n Reborn : 游戏内点击复活 \n '
    })
    clickType = 0

    @property({
        'displayName' : '按钮显示顺序'
        // visible() {
        //     return this.clickType == ClickEventOptions.Types.FinishDownload || this.clickType == ClickEventOptions.Types.Download
        // }
    })
    value = 0


    static Types = {
        'FinishDownload' : 0 ,
        'Download' : 1 ,
        'Reborn' : 2
    }
}


@ccclass
@menu('通用组件/平台事件管理')
export default class CoolplayableSdkEvent extends cc.Component {
    @property() _type = 0


    @property({
        'type' : cc.Enum(CoolplayableSdkEvent.Types) ,
        'displayName' : '事件类型' ,
        'tooltip' : 'ViewEvent : 场景事件(进入场景/游戏结束) , 进入第一个场景时自动绑定FirstTouch(首次触摸)事件\n ClickEvent : 点击事件(复活/下载)'
    })
    get type():number {
        return this._type
    }
    set type(value: number) {
        this._type = value
    }


    @property({
        'type' : ViewEventOptions ,
        'displayName' : '界面事件' ,
        visible() {
            return this.type === CoolplayableSdkEvent.Types.ViewEvent
        }
    })
    viewEventOptions = new ViewEventOptions()

    @property({
        'type' : ClickEventOptions ,
        'displayName' : '界面事件' ,
        visible() {
            return this.type === CoolplayableSdkEvent.Types.ClickEvent
        }
    })
    clickEventOptions = new ClickEventOptions()



    start():void{

        if (CoolplayableSdkEvent.bindingFirstTouch === false) {
            CoolplayableSdkEvent.bindingFirstTouch = true
            CoolplayableSdkEvent.bindFirstTouch()
        }


        switch (this.type) {
            case CoolplayableSdkEvent.Types.ViewEvent:
                CoolplayableSdk.EnterSection(this.viewEventOptions.EnterSectionValue)
                if (this.viewEventOptions.GameEnd) {
                    CoolplayableSdk.GameEnd()
                }
                break
            case CoolplayableSdkEvent.Types.ClickEvent:
                if (this.getComponent(cc.Button) === null) {
                    this.addComponent(cc.Button)
                }
                this.node.on('click' , () => {
                    if (this.clickEventOptions.clickType === ClickEventOptions.Types.FinishDownload) {
                        CoolplayableSdk.ClickFinishDownloadBar(this.clickEventOptions.value)
                    } else if (this.clickEventOptions.clickType ===ClickEventOptions.Types.Download) {
                        CoolplayableSdk.ClickDownloadBar(this.clickEventOptions.value)
                    } else {
                        CoolplayableSdk.ClickReborn(this.clickEventOptions.value)
                    }
                })
                break
        }

    }


    static bindFirstTouch():void {
        const fitstTouchCallback = () => {
            cc.Canvas.instance.node.off('touchstart' , fitstTouchCallback)
            cc.Canvas.instance.node.getComponentsInChildren(cc.Button).forEach((button) => {
                button.node.off('touchstart' , fitstTouchCallback)
            })

            CoolplayableSdk.FirstTouch()
        }

        cc.Canvas.instance.node.once('touchstart' , fitstTouchCallback)
        cc.Canvas.instance.node.getComponentsInChildren(cc.Button).forEach((button) => {
            button.node.once('touchstart' , fitstTouchCallback)
        })
    }


    static bindingFirstTouch = false

    static Types = {
        'ViewEvent' : 0 ,
        'ClickEvent' : 1
    }

}
