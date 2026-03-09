import { Editor } from '../core/Editor'

export class SelectionBoxController {
    private editor: Editor
    private doc!: Document

    private dragging = false
    private pending = false

    private startX = 0
    private startY = 0

    private box!: HTMLDivElement

    constructor(editor: Editor) {
        this.editor = editor
    }

    public mount(doc: Document) {
        this.doc = doc

        this.box = this.doc.createElement('div')
        this.box.id = 'selection-box'

        Object.assign(this.box.style, {
            position: 'absolute',
            border: '1px dashed red',
            background: 'rgba(59,130,246,0.1)',
            pointerEvents: 'none',
            display: 'none',
            zIndex: '9999',
        })

        this.doc.body.appendChild(this.box)

        this.doc.addEventListener('mousedown', this.onMouseDown)
        this.doc.addEventListener('mousemove', this.onMouseMove)
        this.doc.addEventListener('mouseup', this.onMouseUp)
    }

    public destroy() {
        this.doc.removeEventListener('mousedown', this.onMouseDown)
        this.doc.removeEventListener('mousemove', this.onMouseMove)
        this.doc.removeEventListener('mouseup', this.onMouseUp)

        this.box.remove()
    }

    private onMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return

        const target = e.target as HTMLElement

        // Ignore clicks on nodes (handled by click selection)
        if (target.closest('[data-node-id]')) return

        e.preventDefault()

        this.pending = true
        this.startX = e.clientX
        this.startY = e.clientY
    }

    private onMouseMove = (e: MouseEvent) => {
        if (!this.pending && !this.dragging) return

        const dx = Math.abs(e.clientX - this.startX)
        const dy = Math.abs(e.clientY - this.startY)

        // Start drag only after small threshold
        if (this.pending) {
            if (dx < 3 && dy < 3) return

            this.pending = false
            this.dragging = true

            this.box.style.display = 'block'
        }

        if (!this.dragging) return

        const x = Math.min(e.clientX, this.startX)
        const y = Math.min(e.clientY, this.startY)

        const w = Math.abs(e.clientX - this.startX)
        const h = Math.abs(e.clientY - this.startY)

        this.box.style.left = `${x}px`
        this.box.style.top = `${y}px`
        this.box.style.width = `${w}px`
        this.box.style.height = `${h}px`
    }

    private onMouseUp = (e: MouseEvent) => {
        if (!this.dragging && !this.pending) return

        const wasDragging = this.dragging

        this.pending = false
        this.dragging = false

        if (!wasDragging) return

        const boxRect = this.box.getBoundingClientRect()

        const nodes = [...this.doc.querySelectorAll('[data-node-id]')] as HTMLElement[]

        const selected: string[] = []

        for (const node of nodes) {
            const rect = node.getBoundingClientRect()

            const intersect =
                rect.left < boxRect.right &&
                rect.right > boxRect.left &&
                rect.top < boxRect.bottom &&
                rect.bottom > boxRect.top

            if (intersect) {
                const id = node.dataset.nodeId!
                selected.push(id)
            }
        }

        if (selected.length === 0) {
            this.editor.clearSelection()
        } else if (e.shiftKey) {
            this.editor.addToSelection(selected)
        } else {
            this.editor.selectMultiple(selected)
        }

        this.box.style.display = 'none'
    }
}
