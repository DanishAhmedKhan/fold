// import { Editor } from '../core/Editor'
// import { dragState } from '../core/DragState'
// import { SelectionBoxController } from '../interaction/SelectionBoxController'

// const mountedDocs = new WeakSet<Document>()

// export class IframeInteractionManager {
//     public editor: Editor
//     public doc!: Document

//     private selectionBox: SelectionBoxController

//     constructor(editor: Editor) {
//         this.editor = editor
//         this.selectionBox = new SelectionBoxController(editor)
//     }

//     public mount(doc: Document) {
//         this.doc = doc

//         if (mountedDocs.has(doc)) {
//             this.cleanup(doc)
//         }

//         doc.addEventListener('dragover', this.handleDragOver)
//         doc.addEventListener('drop', this.handleDrop)

//         mountedDocs.add(doc)

//         this.selectionBox.mount(doc)
//     }

//     private cleanup(doc: Document) {
//         doc.removeEventListener('dragover', this.handleDragOver)
//         doc.removeEventListener('drop', this.handleDrop)
//     }

//     public destroy() {
//         this.cleanup(this.doc)

//         mountedDocs.delete(this.doc)

//         this.selectionBox.destroy()
//     }

//     private handleDragOver = (e: DragEvent) => {
//         e.preventDefault()
//     }

//     private handleDrop = (e: DragEvent) => {
//         e.preventDefault()

//         const type = dragState.type
//         if (!type) return

//         dragState.type = null

//         const target = e.target as Element

//         const parent = target.closest('[data-node-id]') as HTMLElement | null
//         const parentId = parent?.dataset.nodeId || this.editor.state.rootId

//         this.editor.addNode(type, parentId)
//     }
// }

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
        doc.addEventListener('dragleave', this.handleDragLeave)

        mountedDocs.add(doc)

        this.selectionBox.mount(doc)
    }

    private cleanup(doc: Document) {
        doc.removeEventListener('dragover', this.handleDragOver)
        doc.removeEventListener('drop', this.handleDrop)
        doc.removeEventListener('dragleave', this.handleDragLeave)
    }

    public destroy() {
        this.cleanup(this.doc)
        mountedDocs.delete(this.doc)
        this.selectionBox.destroy()
    }

    // -------------------------------
    // DRAG OVER (MAIN ENGINE LOOP)
    // -------------------------------
    private handleDragOver = (e: DragEvent) => {
        e.preventDefault()

        const type = dragState.type
        if (!type) return

        const target = e.target as HTMLElement
        const containerEl = target.closest('[data-node-id]') as HTMLElement | null

        const parentId = containerEl?.dataset.nodeId || this.editor.state.rootId

        const parentNode = this.editor.getNode(parentId)
        if (!parentNode) return

        // create placeholder if not exists
        if (!dragState.placeholderId) {
            const node = this.editor.addNode('__placeholder__', parentId, true)
            dragState.placeholderId = node.id
        }

        const placeholderId = dragState.placeholderId
        if (!placeholderId) return

        // compute index
        const index = this.computeInsertIndex(containerEl, e.clientY)

        // move placeholder
        this.editor.moveNode(placeholderId, parentId, index)
    }

    // -------------------------------
    // DROP
    // -------------------------------
    private handleDrop = (e: DragEvent) => {
        e.preventDefault()

        const type = dragState.type
        const placeholderId = dragState.placeholderId

        if (!type || !placeholderId) return

        const placeholderNode = this.editor.getNode(placeholderId)
        if (!placeholderNode) return

        const parentId = placeholderNode.parent!
        const parent = this.editor.getNode(parentId)
        if (!parent) return

        const index = parent.children.indexOf(placeholderId)

        // remove placeholder
        this.editor.deleteNode(placeholderId)

        // insert real node at same position
        const newNode = this.editor.addNode(type, parentId)

        // move to correct index
        this.editor.moveNode(newNode.id, parentId, index)

        // reset drag state
        dragState.type = null
        dragState.placeholderId = null
    }

    // -------------------------------
    // CLEANUP WHEN DRAG LEAVES
    // -------------------------------
    private handleDragLeave = () => {
        this.cleanupPlaceholder()
    }

    private cleanupPlaceholder() {
        const id = dragState.placeholderId
        if (!id) return

        this.editor.deleteNode(id)
        dragState.placeholderId = null
    }

    // -------------------------------
    // CORE LOGIC (INDEX CALCULATION)
    // -------------------------------
    private computeInsertIndex(containerEl: HTMLElement | null, mouseY: number) {
        if (!containerEl) return 0

        const children = Array.from(containerEl.children)

        for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement

            // skip placeholder itself
            if (child.dataset.type === '__placeholder__') continue

            const rect = child.getBoundingClientRect()
            const mid = rect.top + rect.height / 2

            if (mouseY < mid) {
                return i
            }
        }

        return children.length
    }
}
