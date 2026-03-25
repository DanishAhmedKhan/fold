import type { EditorNode } from '../../core/types'

export abstract class OverlayElement {
    public el!: HTMLElement
    protected currentNode?: EditorNode

    constructor(protected overlayRoot: HTMLElement, protected name: string) {}

    protected createBase() {
        this.el = document.createElement('div')

        this.el.style.position = 'absolute'
        this.el.style.boxSizing = 'border-box'

        this.overlayRoot.appendChild(this.el)
    }

    public show() {
        this.el.style.display = 'block'
    }

    public hide() {
        this.el.style.display = 'hide'
    }

    public setNode(node?: EditorNode) {
        this.currentNode = node
        if (node) this.onNodeChange(node)
    }

    protected abstract onNodeChange(node: EditorNode): void
}
