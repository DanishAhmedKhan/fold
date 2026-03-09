import { Editor } from '../core/Editor'

export class SelectionBoxController {
    private editor: Editor
    private doc!: Document

    private dragging = false
    private startX = 0
    private startY = 0
    private box!: HTMLDivElement

    constructor(editor: Editor) {
        this.editor = editor
    }

    public mount(doc: Document) {
        this.doc = doc

        this.box = document.createElement('div')
        this.box.id = 'selection-box'

        Object.assign(this.box.style, {
            position: 'absolute',
            border: '1px dashed #3b82f6',
            background: 'rgba(59,130,246,0.1)',
            pointerEvents: 'none',
            display: 'none',
            zIndex: '9999',
        })

        document.body.appendChild(this.box)

        doc.addEventListener('mousedown', this.onMouseDown)
        doc.addEventListener('mousemove', this.onMouseMove)
        doc.addEventListener('mouseup', this.onMouseUp)
    }

    public destroy() {
        this.doc.removeEventListener('mousedown', this.onMouseDown)
        this.doc.removeEventListener('mousemove', this.onMouseMove)
        this.doc.removeEventListener('mouseup', this.onMouseUp)
    }

    private onMouseDown = (e: MouseEvent) => {
        const target = e.target as HTMLElement

        if (target.closest('[data-node-id]')) return

        this.dragging = true

        this.startX = e.clientX
        this.startY = e.clientY

        console.log('mouse down')
        this.box.style.display = 'block'
        this.box.style.left = `${this.startX}px`
        this.box.style.top = `${this.startY}px`
        this.box.style.width = '0px'
        this.box.style.height = '0px'
    }

    private onMouseMove = (e: MouseEvent) => {
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

    private onMouseUp = () => {
        if (!this.dragging) return
        this.dragging = false

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

        this.editor.selectMultiple(selected)

        this.box.style.display = 'none'
    }
}
