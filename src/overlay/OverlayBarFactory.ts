import type { OverlayBarConfig, OverlayConfig } from './OverlatConfig'
import type { OverlayBarInstance } from './OverlayTypes'

export class OverlayBarFactory {
    constructor(
        private config: OverlayConfig,
        private overlayRoot: HTMLElement,
        private barInstances: Map<string, OverlayBarInstance>,
    ) {}

    public createBars() {
        for (const bar of this.config.bars) {
            const visibility = {
                hover: bar.visibility?.hover ?? true,
                selection: bar.visibility?.selection ?? true,
            }

            if (visibility.hover) {
                this.createBarInstance(bar, 'hover')
            }

            if (visibility.selection) {
                this.createBarInstance(bar, 'selection')
            }
        }
    }

    private createBarInstance(bar: OverlayBarConfig, mode: 'hover' | 'selection') {
        const el = this.createBarElement(bar, mode)

        const id = `${bar.id}-${mode}`

        this.overlayRoot.appendChild(el)

        // measure size
        const rect = el.getBoundingClientRect()

        el.style.display = 'none'

        this.barInstances.set(id, {
            id,
            barId: bar.id,
            mode,
            element: el,
            width: rect.width || 80,
            height: rect.height || 24,
        })
    }

    private createBarElement(bar: OverlayBarConfig, mode: 'hover' | 'selection') {
        const el = document.createElement('div')

        const overlayColor = mode === 'hover' ? this.config.hover.color : this.config.selection.color

        el.style.position = 'absolute'
        el.style.pointerEvents = 'auto'
        el.style.display = 'flex'
        el.style.gap = '4px'
        el.style.padding = '2px 6px'
        el.style.fontSize = '12px'
        el.style.color = 'white'
        el.style.background = overlayColor
        el.style.alignItems = 'center'
        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.25)'

        if (bar.orientation === 'vertical') {
            el.style.flexDirection = 'column'
        } else {
            el.style.flexDirection = 'row'
        }

        // apply custom bar style from config
        if (bar.style) {
            Object.assign(el.style, bar.style)
        }

        // create actions
        for (const action of bar.actions) {
            const btn = document.createElement('button')

            btn.style.height = '22px'
            btn.style.minWidth = '22px'
            btn.style.display = 'flex'
            btn.style.alignItems = 'center'
            btn.style.justifyContent = 'center'
            btn.style.cursor = 'pointer'
            btn.style.border = 'none'
            btn.style.background = 'rgba(255,255,255,0.1)'
            btn.style.color = 'white'
            btn.style.fontSize = '12px'

            if (action.icon) btn.textContent = action.icon
            if (action.label) btn.textContent = action.label
            if (action.tooltip) btn.title = action.tooltip

            el.appendChild(btn)
        }

        return el
    }
}
