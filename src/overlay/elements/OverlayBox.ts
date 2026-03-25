import { OverlayElement } from './OverlayElement'
import type { OverlayBoxConfig } from '../OverlatConfig'
import type { Rect } from '../OverlayTypes'
import { OverlayBar } from './OverlayBar'

export class OverlayBox extends OverlayElement {
    protected bar!: OverlayBar

    constructor(overlayRoot: HTMLElement, name: string, private config: OverlayBoxConfig) {
        super(overlayRoot, name)
        this.create()
    }

    private create() {
        this.createBase()

        const { borderStyle, index } = this.config

        this.el.style.pointerEvents = 'none'
        this.el.style.zIndex = String(index)

        const { width, style, color } = borderStyle
        this.el.style.border = `${width}px ${style} ${color}`
    }

    public show(rect: Rect) {
        super.show()
        this.el.style.transform = `translate3d(${rect.left}px,${rect.top}px,0)`
        this.el.style.width = rect.width + 'px'
        this.el.style.height = rect.height + 'px'
    }

    protected onNodeChange() {}
}
