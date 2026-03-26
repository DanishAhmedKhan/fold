import type { Editor } from '../core/Editor'

export class EmptySlotRenderer {
    private elements = new Map<string, HTMLElement>()

    constructor(private editor: Editor, private overlayRoot: HTMLElement) {}

    public render() {
        const nodes = this.editor.getAllNodes()

        for (const node of nodes) {
            if (!node.slots) continue

            for (const slot of node.slots) {
                const children = node.slotChildren?.[slot] || []

                const key = `${node.id}:${slot}`

                if (children.length === 0) {
                    this.showPlaceholder(node.id, slot, key)
                } else {
                    this.hidePlaceholder(key)
                }
            }
        }
    }

    private showPlaceholder(nodeId: string, slot: string, key: string) {
        let el = this.elements.get(key)

        if (!el) {
            el = document.createElement('div')

            el.style.position = 'absolute'
            el.style.border = '2px dashed #aaa'
            el.style.borderRadius = '6px'
            el.style.display = 'flex'
            el.style.alignItems = 'center'
            el.style.justifyContent = 'center'
            el.style.fontSize = '12px'
            el.style.color = '#666'
            el.style.pointerEvents = 'auto'
            el.textContent = 'Drop here'

            this.overlayRoot.appendChild(el)
            this.elements.set(key, el)
        }

        const rect = this.getSlotRect(nodeId, slot)

        if (!rect) {
            el.style.display = 'none'
            return
        }

        el.style.display = 'flex'
        el.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`
        el.style.width = rect.width + 'px'
        el.style.height = rect.height + 'px'
    }

    private hidePlaceholder(key: string) {
        const el = this.elements.get(key)
        if (el) el.style.display = 'none'
    }

    private getSlotRect(nodeId: string, slot: string) {
        // 🔥 IMPORTANT: depends on your DOM structure

        const el = this.editor.nodeDomRegistry.get(nodeId)
        if (!el) return null

        const slotEl = el.querySelector(`[data-slot="${slot}"]`) as HTMLElement
        if (!slotEl) return null

        const r = slotEl.getBoundingClientRect()

        return {
            left: r.left,
            top: r.top,
            width: r.width,
            height: r.height,
        }
    }
}
