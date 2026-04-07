// import type { Editor } from '../core/Editor'

// export class EmptySlotRenderer {
//     private elements = new Map<string, HTMLElement>()

//     constructor(private editor: Editor, private overlayRoot: HTMLElement) {}

//     public render() {
//         const nodes = this.editor.getAllNodes()

//         for (const node of nodes) {
//             if (!node.slots) continue

//             for (const slot of node.slots) {
//                 const children = node.slotChildren?.[slot] || []

//                 const key = `${node.id}:${slot}`

//                 if (children.length === 0) {
//                     this.showPlaceholder(node.id, slot, key)
//                 } else {
//                     this.hidePlaceholder(key)
//                 }
//             }
//         }
//     }

//     private showPlaceholder(nodeId: string, slot: string, key: string) {
//         let el = this.elements.get(key)

//         if (!el) {
//             el = document.createElement('div')

//             el.style.position = 'absolute'
//             el.style.border = '2px dashed #aaa'
//             el.style.borderRadius = '6px'
//             el.style.display = 'flex'
//             el.style.alignItems = 'center'
//             el.style.justifyContent = 'center'
//             el.style.fontSize = '12px'
//             el.style.color = '#666'
//             el.style.pointerEvents = 'auto'
//             el.textContent = 'Drop here'

//             this.overlayRoot.appendChild(el)
//             this.elements.set(key, el)
//         }

//         const rect = this.getSlotRect(nodeId, slot)

//         if (!rect) {
//             el.style.display = 'none'
//             return
//         }

//         el.style.display = 'flex'
//         el.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`
//         el.style.width = rect.width + 'px'
//         el.style.height = rect.height + 'px'
//     }

//     private hidePlaceholder(key: string) {
//         const el = this.elements.get(key)
//         if (el) el.style.display = 'none'
//     }

//     private getSlotRect(nodeId: string, slot: string) {
//         // 🔥 IMPORTANT: depends on your DOM structure

//         const el = this.editor.nodeDomRegistry.get(nodeId)
//         if (!el) return null

//         const slotEl = el.querySelector(`[data-slot="${slot}"]`) as HTMLElement
//         if (!slotEl) return null

//         const r = slotEl.getBoundingClientRect()

//         return {
//             left: r.left,
//             top: r.top,
//             width: r.width,
//             height: r.height,
//         }
//     }
// }

// import type { Editor } from '../core/Editor'
// import type { EditorNode } from '../core/types'

// export class EmptySlotRenderer {
//     constructor(private editor: Editor, private overlayRoot: HTMLElement) {}

//     public render() {
//         const nodes = this.editor.

//         const elDef = this.editor.getElement(node.type)

//         if (!elDef?.placeholder) return
//         if (node.children && node.children.length > 0) return

//         const doc = container.ownerDocument

//         const placeholder = doc.createElement('div')
//         placeholder.className = 'fold-placeholder'

//         placeholder.innerText = 'Add element'

//         // styles
//         Object.assign(placeholder.style, {
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             width: '100%',
//             height: '100%',
//             minHeight: '60px',
//             border: '2px dashed #ccc',
//             color: '#999',
//             fontSize: '14px',
//             cursor: 'pointer',
//             pointerEvents: 'auto', // IMPORTANT
//         })

//         // click → open element library / insert
//         placeholder.onclick = (e) => {
//             e.stopPropagation()

//             this.editor.actions.openInsertMenu({
//                 parentId: node.id,
//             })
//         }

//         container.appendChild(placeholder)
//     }
// }
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

            // ✅ core condition
            if (!element?.placeholder) return
            if (node.children.length > 0) return

            // optional UX: hide when selected
            if (this.editor.state.selectedIds.has(nodeId)) return

            // ignore collapsed nodes
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

        // cleanup
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

        // interactions
        el.onclick = (e) => {
            e.stopPropagation()

            this.editor.selectNode(nodeId)

            // trigger insert UI (you can replace later)
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
