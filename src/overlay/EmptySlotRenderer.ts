import type { Editor } from '../core/Editor'
import type { LayoutSnapshot } from './OverlayTypes'
import type { Rect } from './OverlayTypes'

export class PlaceholderLayer {
    private elements = new Map<string, HTMLElement>()

    constructor(private root: HTMLElement, private editor: Editor) {}

    public render(snapshot: LayoutSnapshot) {
        const active = new Set<string>()

        snapshot.nodes.forEach((rect, nodeId) => {
            const node = this.editor.getNode(nodeId)
            if (!node) return

            const element = this.editor.elementRegistry.get(node.type)

            if (!element?.placeholder) return
            if (node.children.length > 0) return

            if (this.editor.state.selectedIds.has(nodeId)) return

            if (rect.width === 0 || rect.height === 0) return

            let el = this.elements.get(nodeId)

            if (!el) {
                el = this.create(nodeId)
                this.root.appendChild(el)
                this.elements.set(nodeId, el)
            }

            active.add(nodeId)

            this.position(el, rect)
        })

        this.elements.forEach((el, id) => {
            if (!active.has(id)) {
                el.remove()
                this.elements.delete(id)
            }
        })
    }

    private position(el: HTMLElement, rect: Rect) {
        el.style.transform = `translate(${rect.left}px, ${rect.top}px)`
        el.style.width = `${rect.width}px`
        el.style.height = `${Math.max(rect.height, 60)}px`
    }

    private create(nodeId: string) {
        const el = document.createElement('div')

        Object.assign(el.style, {
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #d9d9d9',
            background: 'rgba(255,255,255,0.65)',
            pointerEvents: 'auto',
            cursor: 'pointer',
            zIndex: '1',
        })

        el.innerHTML = `
            <div style="text-align:center; pointer-events:none;">
                <div style="font-size:18px;">＋</div>
                <div style="font-size:12px;">Add Element</div>
            </div>
        `

        el.onclick = (e) => {
            e.stopPropagation()

            this.editor.selectNode(nodeId)

            this.editor.store.emit({
                type: 'OPEN_INSERT_MENU',
                parentId: nodeId,
            } as any)
        }

        el.onmouseenter = () => {
            this.editor.hoverNode(nodeId)
        }

        el.onmouseleave = () => {
            this.editor.clearHover()
        }

        return el
    }
}
