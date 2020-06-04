import Util from './Util'
import FrameAnime from './FrameAnime'

const { ccclass , menu } = cc._decorator

@ccclass
@menu('通用组件/弹窗管理器')
export default class Popup extends cc.Component {
    // private popups: cc.Node[] = []
    private targets: cc.Node[] = []

    /**
     * 在Popop组件的节点下面查找一个 name属性为 `POPUP-${name}` 的节点作为弹窗显示出来
     * @param name
     */
    show(name: string): Promise<null> {

        this.node.active = true

        const target = Util.getNodeInChildrenByName(this , `POPUP-${name}`)

        if (target !== null) {
            if (target.getComponent(FrameAnime) === null) {
                target.addComponent(FrameAnime)
            }

            this.targets.unshift(target)

            return target
            .getComponent(FrameAnime)
            .anime({ 'opacity' : 0 , 'y' : '-200' , 'scale' : 0.9 })
            .show()
            .anime(0.3 , [{ 'opacity' : 255 , 'scale' : 1 } , { 'y' : '+200' , 'easingType' : cc.easeBackOut() }])
            .run()
            .end()
        }
    }

    close(name?: string): Promise<null> {

        if (this.targets.length > 0) {

            const target = name ? this.targets.find((node) => node.name === `POPUP-${name}`) : this.targets[0]

            if (target) {

                Util.removeItem(this.targets , target)

                return target
                .getComponent(FrameAnime)
                .anime(0.3 , [{ 'opacity' : 0 , 'scale' : 0.95 } , { 'y' : '-200' , 'easingType' : cc.easeBackIn() }])
                .hide()
                .anime({ 'y' : '+200' })
                .run()
                .end(() => {
                    if (this.targets.length === 0) {
                        this.node.active = false
                    }
                })
            }
        }

        return null
    }
}
