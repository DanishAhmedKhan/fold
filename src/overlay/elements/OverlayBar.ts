import type { EditorNode } from '../../core/types'
import type { OverlayBarConfig, OverlayConfig } from '../OverlatConfig'
import { OverlayElement } from './OverlayElement'

export class OverlayBar extends OverlayElement {
    private width = 80
    private height = 24

    constructor(
        overlayRoot: HTMLElement,
        name: string,
        private config: OverlayBarConfig,
        private overlayConfig: OverlayConfig,
    ) {
        super(overlayRoot, name)
        this.create()
    }

    private create() {
        this.createBase()

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
        this.el.style.background = overlayColor
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
                btn.dataset.labelTemplate = action.label
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

        // measure once
        const rect = this.el.getBoundingClientRect()
        this.width = rect.width || 80
        this.height = rect.height || 24

        this.hide()
    }

    public updatePosition(x: number, y: number) {
        this.el.style.transform = `translate3d(${x}px,${y}px,0)`
    }

    protected onNodeChange(node: EditorNode) {
        const buttons = this.el.querySelectorAll('button')

        buttons.forEach((btn) => {
            const template = btn.dataset.labelTemplate
            if (!template) return

            btn.textContent = this.resolveTemplate(template, node)
        })
    }

    private resolveTemplate(template: string, node: EditorNode): string {
        return template.replace(/\$\{([^}]+)\}/g, (_, expr) => {
            const path = expr.trim().split('.')

            let value: any = { element: node }

            for (const key of path) {
                value = value?.[key]
                if (value === undefined) return ''
            }

            return String(value)
        })
    }
}
