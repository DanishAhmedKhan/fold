import { Editor } from '../core/Editor'

export class OverlayInteractionManager {
    private doc!: Document

    private hoverDelay = 50
    private moveThreshold = 6

    private hoverTimer: number | null = null
    private rafPending = false

    private pendingHoverId: string | null = null
    private currentHoverId: string | null = null

    private startX = 0
    private startY = 0
    private lastEvent!: MouseEvent

    private nodeMap: WeakMap<HTMLElement, string>

    constructor(private editor: Editor, nodeMap: WeakMap<HTMLElement, string>) {
        this.nodeMap = nodeMap
    }

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

        if (this.hoverTimer) clearTimeout(this.hoverTimer)
    }

    private handleClick = (e: MouseEvent) => {
        const el = e.target as HTMLElement
        const id = this.nodeMap.get(el)

        if (!id) return

        e.preventDefault()
        e.stopPropagation()

        if (e.shiftKey) {
            this.editor.toggleSelectNode(id)
        } else {
            this.editor.selectNode(id)
        }
    }

    private handleMouseMove = (e: MouseEvent) => {
        this.lastEvent = e

        if (!this.rafPending) {
            this.rafPending = true
            requestAnimationFrame(this.processMouseMove)
        }
    }

    private processMouseMove = () => {
        this.rafPending = false

        const e = this.lastEvent
        const target = e.target as HTMLElement

        const id = this.nodeMap.get(target) ?? null

        if (id === this.pendingHoverId) return

        this.pendingHoverId = id

        if (this.hoverTimer) clearTimeout(this.hoverTimer)

        this.startX = e.clientX
        this.startY = e.clientY

        this.hoverTimer = window.setTimeout(() => {
            const dx = Math.abs(e.clientX - this.startX)
            const dy = Math.abs(e.clientY - this.startY)

            if (dx > this.moveThreshold || dy > this.moveThreshold) {
                return
            }

            if (this.currentHoverId !== this.pendingHoverId) {
                this.currentHoverId = this.pendingHoverId
                this.editor.hoverNode(this.currentHoverId)
            }
        }, this.hoverDelay)
    }

    private handleMouseLeave = () => {
        if (this.hoverTimer) clearTimeout(this.hoverTimer)

        this.pendingHoverId = null
        this.currentHoverId = null

        this.editor.hoverNode(null)
    }
}
