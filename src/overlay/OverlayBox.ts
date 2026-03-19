import type { OverlayBoxConfig } from './OverlatConfig'
import type { Rect } from './OverlayTypes'

export class OverlayBox {
    public box!: HTMLElement

    constructor(private overlayRoot: HTMLElement, config: OverlayBoxConfig) {
        this.create(config)
    }

    public create(config: OverlayBoxConfig) {
        const { borderStyle, index } = config

        this.box = document.createElement('div')

        this.box.style.position = 'absolute'
        this.box.style.pointerEvents = 'none'
        this.box.style.boxSizing = 'border-box'
        this.box.style.zIndex = index + ''

        const { width, style, color } = borderStyle
        const border = `${width}px ${style} ${color}`
        this.box.style.border = border

        this.overlayRoot.appendChild(this.box)
    }

    public show(rect: Rect) {
        this.box.style.display = 'block'

        this.box.style.transform = `translate3d(${rect.left}px,${rect.top}px,0)`

        this.box.style.width = rect.width + 'px'
        this.box.style.height = rect.height + 'px'
    }

    public hide() {
        this.box.style.display = 'none'
    }
}
