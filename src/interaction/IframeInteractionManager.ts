import { Editor } from '../core/Editor'
import { dragState } from '../core/DragState'
import { SelectionBoxController } from '../interaction/SelectionBoxController'

const mountedDocs = new WeakSet<Document>()

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

        if (mountedDocs.has(doc)) {
            this.cleanup(doc)
        }

        doc.addEventListener('dragover', this.handleDragOver)
        doc.addEventListener('drop', this.handleDrop)

        mountedDocs.add(doc)

        this.selectionBox.mount(doc)
    }

    private cleanup(doc: Document) {
        doc.removeEventListener('dragover', this.handleDragOver)
        doc.removeEventListener('drop', this.handleDrop)
    }

    public destroy() {
        this.cleanup(this.doc)

        mountedDocs.delete(this.doc)

        this.selectionBox.destroy()
    }

    private handleDragOver = (e: DragEvent) => {
        e.preventDefault()
    }

    private handleDrop = (e: DragEvent) => {
        e.preventDefault()

        const type = dragState.type
        if (!type) return

        dragState.type = null

        const target = e.target as Element

        const parent = target.closest('[data-node-id]') as HTMLElement | null
        const parentId = parent?.dataset.nodeId || this.editor.state.rootId

        this.editor.addNode(type, parentId)
    }
}
