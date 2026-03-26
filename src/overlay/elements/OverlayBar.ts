import type { OverlayBarConfig, OverlayConfig } from '../OverlatConfig'
import { OverlayElement } from './OverlayElement'

export class OverlayBar extends OverlayElement {
    public config: OverlayBarConfig

    constructor(
        overlayRoot: HTMLElement,
        name: string,
        config: OverlayBarConfig,
        private overlayConfig: OverlayConfig,
    ) {
        super(overlayRoot, name)
        this.config = config

        this.create()
    }

    private create() {
        this.createBase()
        this.el.setAttribute('fold-overlay-bar-' + this.name, '')

        const overlayColor =
            this.name === 'hover'
                ? this.overlayConfig.hover.borderStyle.color
                : this.overlayConfig.selection.borderStyle.color

        const zIndex = this.name === 'hover' ? '9999' : '999'

        this.el.style.pointerEvents = 'auto'
        this.el.style.display = 'flex'
        this.el.style.gap = '4px'
        this.el.style.padding = '2px 6px'
        this.el.style.fontSize = '12px'
        this.el.style.color = 'white'
        this.el.style.alignItems = 'center'
        this.el.style.background = overlayColor || 'blue'
        this.el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.25)'
        this.el.style.zIndex = zIndex

        this.el.style.flexDirection = this.config.orientation === 'vertical' ? 'column' : 'row'

        if (this.config.style) {
            Object.assign(this.el.style, this.config.style)
        }

        for (const action of this.config.actions ?? []) {
            const btn = document.createElement('button')

            btn.style.display = 'flex'
            btn.style.alignItems = 'center'
            btn.style.justifyContent = 'center'
            btn.style.cursor = 'pointer'
            btn.style.border = 'none'
            btn.style.background = 'transparent'
            btn.style.color = 'white'
            btn.style.fontSize = '12px'

            if (action.label) {
                btn.dataset.template = action.label
            }

            if (action.icon) {
                if (typeof action.icon === 'string') {
                    btn.textContent = action.icon
                } else {
                    btn.appendChild(action.icon)
                }
            }

            if (action.tooltip) btn.title = action.tooltip

            this.el.appendChild(btn)
        }

        this.hide()
    }

    protected onNodeChange() {}

    protected afterNodeUpdate() {
        this.measure()
    }
}
