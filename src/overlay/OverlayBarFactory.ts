import type { EditorNode } from '../core/types'
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
        const overlayZIndex = mode === 'hover' ? '9999' : '999'

        el.style.position = 'absolute'
        el.style.pointerEvents = 'auto'
        el.style.display = 'flex'
        el.style.gap = '4px'
        el.style.padding = '2px 6px'
        el.style.fontSize = '12px'
        el.style.color = 'white'
        el.style.alignItems = 'center'
        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.25)'
        el.style.background = overlayColor
        el.style.zIndex = overlayZIndex

        if (bar.orientation === 'vertical') {
            el.style.flexDirection = 'column'
        } else {
            el.style.flexDirection = 'row'
        }

        if (bar.style) {
            Object.assign(el.style, bar.style)
        }

        for (const action of bar.actions ?? []) {
            const btn = document.createElement('button')

            btn.style.display = 'flex'
            btn.style.alignItems = 'center'
            btn.style.justifyContent = 'center'
            btn.style.cursor = 'pointer'
            btn.style.border = 'none'
            btn.style.background = 'transparent'
            btn.style.color = 'white'
            btn.style.fontSize = '12px'

            if (action.icon) {
                if (typeof action.icon === 'string') {
                    btn.textContent = action.icon
                } else {
                    btn.appendChild(action.icon)
                }
            }
            if (action.label) btn.textContent = action.label
            if (action.tooltip) btn.title = action.tooltip

            el.appendChild(btn)
        }

        return el
    }

    private createBarElement2(bar: OverlayBarConfig, mode: 'hover' | 'selection') {
        const el = document.createElement('div')

        const overlayColor = mode === 'hover' ? this.config.hover.color : this.config.selection.color
        const overlayZIndex = mode === 'hover' ? '9999' : '999'

        el.style.position = 'absolute'
        el.style.pointerEvents = 'auto'
        el.style.display = 'flex'
        el.style.gap = '4px'
        el.style.padding = '2px 6px'
        el.style.fontSize = '12px'
        el.style.color = 'white'
        el.style.alignItems = 'center'
        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.25)'
        el.style.background = overlayColor
        el.style.zIndex = overlayZIndex

        el.style.flexDirection = bar.orientation === 'vertical' ? 'column' : 'row'

        if (bar.style) {
            Object.assign(el.style, bar.style)
        }

        for (const action of bar.actions ?? []) {
            const btn = document.createElement('button')

            btn.style.display = 'flex'
            btn.style.alignItems = 'center'
            btn.style.justifyContent = 'center'
            btn.style.cursor = 'pointer'
            btn.style.border = 'none'
            btn.style.background = 'transparent'
            btn.style.color = 'white'
            btn.style.fontSize = '12px'

            // 👇 store template
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

            el.appendChild(btn)
        }

        return el
    }

    public updateBarContent(node: EditorNode) {
        for (const instance of this.barInstances.values()) {
            const el = instance.element

            const buttons = el.querySelectorAll('button')

            buttons.forEach((btn) => {
                const template = btn.dataset.labelTemplate
                if (!template) return

                btn.textContent = this.resolveTemplate(template, node)
            })
        }
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
