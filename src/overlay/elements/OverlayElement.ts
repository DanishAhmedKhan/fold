import type { EditorNode } from '../../core/types'
import type { Rect } from '../OverlayTypes'

export abstract class OverlayElement {
    public el!: HTMLElement
    protected currentNode?: EditorNode

    protected size = {
        width: 0,
        height: 0,
    }

    constructor(protected overlayRoot: HTMLElement, protected name: string) {}

    protected createBase() {
        this.el = document.createElement('div')

        this.el.style.position = 'absolute'
        this.el.style.boxSizing = 'border-box'

        this.overlayRoot.appendChild(this.el)
    }

    public show() {
        this.el.style.display = 'flex'
    }

    public hide() {
        this.el.style.display = 'none'
    }

    public updatePosition(x: number, y: number) {
        this.el.style.transform = `translate3d(${x}px,${y}px,0)`
    }

    public updateSize(width: number, height: number) {
        this.el.style.width = width + 'px'
        this.el.style.height = height + 'px'
    }

    public update(rect: Rect) {
        this.updatePosition(rect.left, rect.top)
        this.updateSize(rect.width, rect.height)
    }

    protected applyTemplates(node: EditorNode) {
        const elements = this.el.querySelectorAll<HTMLElement>('[data-template]')

        elements.forEach((el) => {
            const template = el.dataset.template
            if (!template) return

            el.textContent = this.resolveTemplate(template, node)
        })
    }

    protected resolveTemplate(template: string, node: EditorNode): string {
        return template.replace(/\$\{([^}]+)\}/g, (_, expr: string) => {
            const path = expr.trim().split('.')

            let value: unknown = { element: node }

            for (const key of path) {
                if (typeof value === 'object' && value !== null && key in value) {
                    value = (value as Record<string, unknown>)[key]
                } else {
                    return ''
                }
            }

            return value != null ? String(value) : ''
        })
    }

    protected measure() {
        const prevDisplay = this.el.style.display

        if (prevDisplay === 'none') {
            this.el.style.display = 'flex'
        }

        const rect = this.el.getBoundingClientRect()

        this.size.width = rect.width || 80
        this.size.height = rect.height || 24

        this.el.style.display = prevDisplay
    }

    public getSize() {
        return this.size
    }

    public setNode(node?: EditorNode) {
        if (this.currentNode?.id === node?.id) return

        this.currentNode = node

        if (node) {
            this.onNodeChange(node)
            this.applyTemplates(node)
            this.afterNodeUpdate()
        }
    }

    protected abstract onNodeChange(node: EditorNode): void

    protected afterNodeUpdate() {}
}
