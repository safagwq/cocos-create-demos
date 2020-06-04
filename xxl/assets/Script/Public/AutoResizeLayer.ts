import Util from './Util'

const { ccclass , menu } = cc._decorator

@ccclass
@menu('通用组件/自动缩放层')
export default class AutoResizeLayer extends cc.Component {
    resizeCallback = null

    onLoad(): void {
        this.resizeCallback = () => {
            this.resizeGame()
        }


        this.resizeGame()
        Util.setResizeCallback(this.resizeCallback)

        cc.game.on(cc.game.EVENT_HIDE , () => {
            Util.globalData.isShow = false
        })
        cc.game.on(cc.game.EVENT_SHOW , () => {
            Util.globalData.isShow = true
        })
    }

    onDestroy(): void {
        Util.clearResizeCallback(this.resizeCallback)
    }

    private resizeGame() {
        const { width , height } = cc.Canvas.instance.node

        let scale = 1

        if (width <= height) {
            if (this.node.width > width) {
                scale = width / this.node.width
            }
        }

        // if (width < this.node.width) {
        //     scale = width / this.node.width
        // }

        Util.globalData.scale = this.node.scale = scale
    }
}
