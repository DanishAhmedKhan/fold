import { Editor } from '../core/Editor'
import { dragState } from '../core/DragState'
import { SelectionBoxController } from '../interaction/SelectionBoxController'

export class IframeInteractionManager {
    public editor: Editor
    public doc!: Document

    private selectionBox: SelectionBoxController

    constructor(editor: Editor) {
        this.editor = editor
        this.selectionBox = new SelectionBoxController(editor)
    }

    public mount(doc: Document) {
        this.doc = doc

        this.doc.addEventListener('click', this.handleClick)
        this.doc.addEventListener('mousemove', this.handleMouseMove)
        this.doc.addEventListener('mouseleave', this.handleMouseLeave)
        this.doc.addEventListener('dragover', this.handleDragOver)
        this.doc.addEventListener('drop', this.handleDrop)

        this.selectionBox.mount(doc)
    }

    public destroy() {
        this.doc.removeEventListener('click', this.handleClick)
        this.doc.removeEventListener('mousemove', this.handleMouseMove)
        this.doc.removeEventListener('mouseleave', this.handleMouseLeave)
        this.doc.removeEventListener('dragover', this.handleDragOver)
        this.doc.removeEventListener('drop', this.handleDrop)

        this.selectionBox.destroy()
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

        if (!el) {
            this.editor.hoverNode(null)
            return
        }

        const id = el.dataset.nodeId!
        this.editor.hoverNode(id)
    }

    private handleMouseLeave = () => {
        this.editor.hoverNode(null)
    }

    private handleDragOver = (e: DragEvent) => {
        e.preventDefault()
    }

    private handleDrop = (e: DragEvent) => {
        e.preventDefault()

        const type = dragState.type
        if (!type) return

        const target = e.target as HTMLElement

        const parent = target.closest('[data-node-id]') as HTMLElement | null
        const parentId = parent?.dataset.nodeId || this.editor.state.rootId

        this.editor.addNode(type, parentId)

        dragState.type = null
    }
}
