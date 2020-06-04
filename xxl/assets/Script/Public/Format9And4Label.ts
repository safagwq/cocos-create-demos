const { ccclass , menu } = cc._decorator

@ccclass
@menu('通用组件/自动格式化9和4的智能Label')
export default class Format9And4Label extends cc.Label {

    private _str = ''
    private static formatSeted = false

    start():void {

        // 判断在客户端还是编辑器里
        // @ts-ignore
        if (typeof Editor === 'object') {
            return
        }

        // @ts-ignore
        if (!Format9And4Label.formatSeted) {
            // @ts-ignore
            Format9And4Label.formatSeted = true

            Object.defineProperty(Format9And4Label.prototype , 'string' , {
                set(v) {
                    this._str = String(v)
                    this._sgNode.setString(this._str.replace(/9/g , '8').replace(/4/g , '5'))
                } ,
                get() {
                    return this._str || this._N$string || this._sgNode && this._sgNode.getString() || ''
                }
            })
        }

        if (/(9|4)/.test(this.string)) {
            this.string = this.string
        }
    }
}
