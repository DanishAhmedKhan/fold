import { Editor } from '../core/Editor'

export class OverlayInteractionManager {
    private doc!: Document

    private hoverDelay = 50
    private hoverTimer: number | null = null
    private pendingHoverId: string | null = null

    constructor(private editor: Editor) {}

    public mount(doc: Document) {
        this.doc = doc

        doc.addEventListener('click', this.handleClick)
        doc.addEventListener('mousemove', this.handleMouseMove)
        doc.addEventListener('mouseleave', this.handleMouseLeave)
    }

    public destroy() {
        this.doc.removeEventListener('click', this.handleClick)
        this.doc.removeEventListener('mousemove', this.handleMouseMove)
        this.doc.removeEventListener('mouseleave', this.handleMouseLeave)

        if (this.hoverTimer) {
            clearTimeout(this.hoverTimer)
        }
    }

    private handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement

        const el = target.closest('[data-node-id]') as HTMLElement | null
        if (!el) return

        e.preventDefault()
        e.stopPropagation()

        const id = el.dataset.nodeId!

        if (e.shiftKey) {
            this.editor.toggleSelectNode(id)
        } else {
            this.editor.selectNode(id)
        }
    }

    private handleMouseMove = (e: MouseEvent) => {
        const target = e.target as HTMLElement

        const el = target.closest('[data-node-id]') as HTMLElement | null
        const id = el?.dataset.nodeId ?? null

        // if same pending hover → ignore
        if (id === this.pendingHoverId) return

        this.pendingHoverId = id

        if (this.hoverTimer) {
            clearTimeout(this.hoverTimer)
        }

        this.hoverTimer = window.setTimeout(() => {
            this.editor.hoverNode(this.pendingHoverId)
        }, this.hoverDelay)
    }

    private handleMouseLeave = () => {
        if (this.hoverTimer) {
            clearTimeout(this.hoverTimer)
        }

        this.pendingHoverId = null
        this.editor.hoverNode(null)
    }
}
