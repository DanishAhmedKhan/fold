import { dragState } from '../core/DragState'
import { Editor } from '../core/Editor'
import type { EditorNode } from '../core/types'
import type { EditorPatch } from '../core/EditorPatch'

export class IframeRenderer {
    public editor: Editor

    public iframe!: HTMLIFrameElement
    public doc!: Document
    public body!: HTMLElement

    public nodeDomMap = new Map<string, HTMLElement>()

    public unsubscribe?: () => void

    constructor(editor: Editor) {
        this.editor = editor
    }

    public mount(iframe: HTMLIFrameElement) {
        this.iframe = iframe

        iframe.srcdoc = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    html, body {
                        margin:0;
                        padding:0;
                        min-height:100vh;
                        box-sizing:border-box;
                        font-family:sans-serif;
                    }

                    * {
                        margin:0;
                        padding:0;
                        box-sizing:border-box;
                    }

                    body {
                        background:white;
                    }

                    [data-node-id] {
                        position: relative;
                    }
                </style>
            </head>
            <body></body>
        </html>
        `

        iframe.onload = () => {
            this.doc = iframe.contentDocument!
            this.body = this.doc.body

            this.renderInitialTree()

            this.subscribeToEditor()

            this.doc.addEventListener('click', (e) => {
                const target = e.target as HTMLElement
                const el = target.closest('[data-node-id]') as HTMLElement | null
                if (!el) return

                e.preventDefault()
                e.stopPropagation()

                const id = el.dataset.nodeId!
                this.editor.selectNode(id)
            })

            this.doc.addEventListener('mousemove', (e) => {
                const target = e.target as HTMLElement
                const el = target.closest('[data-node-id]') as HTMLElement | null

                if (!el) {
                    this.editor.hoverNode(null)
                    return
                }

                const id = el.dataset.nodeId!
                this.editor.hoverNode(id)
            })

            this.doc.addEventListener('mouseleave', () => {
                this.editor.hoverNode(null)
            })

            this.doc.addEventListener('dragover', (e) => {
                e.preventDefault()
            })

            this.doc.addEventListener('drop', (e) => {
                e.preventDefault()

                const type = dragState.type
                if (!type) return

                const target = e.target as HTMLElement
                const parent = target.closest('[data-node-id]') as HTMLElement | null
                const parentId = parent?.dataset.nodeId || this.editor.state.rootId

                this.editor.addNode(type, parentId)

                dragState.type = null
            })
        }
    }

    public subscribeToEditor() {
        this.unsubscribe = this.editor.subscribe((patch: EditorPatch) => {
            switch (patch.type) {
                case 'ADD_NODE':
                    this.mountNode(patch.nodeId)
                    break

                case 'REMOVE_NODE':
                    this.unmountNode(patch.nodeId)
                    break

                case 'UPDATE_STYLE':
                    this.updateNodeStyles(patch.nodeId)
                    break

                case 'MOVE_NODE':
                    this.moveNode(patch.nodeId)
                    break
            }
        })
    }

    public renderInitialTree() {
        this.body.innerHTML = ''

        const root = this.editor.getNode(this.editor.state.rootId)
        if (!root) return

        const dom = this.renderNode(root)
        this.body.appendChild(dom)
    }

    public renderNode(node: EditorNode): HTMLElement {
        const element = this.editor.registry.get(node.type)

        const el = element ? element.render(this.doc, node) : this.doc.createElement('div')

        el.dataset.nodeId = node.id

        this.nodeDomMap.set(node.id, el)

        this.applyStyles(el, node)

        node.children.forEach((childId) => {
            const child = this.editor.getNode(childId)
            if (!child) return

            const childDom = this.renderNode(child)
            el.appendChild(childDom)
        })

        return el
    }

    public mountNode(nodeId: string) {
        const node = this.editor.getNode(nodeId)
        if (!node) return

        const parentDom = this.nodeDomMap.get(node.parent!)
        if (!parentDom) return

        const dom = this.renderNode(node)
        parentDom.appendChild(dom)
    }

    public unmountNode(nodeId: string) {
        const dom = this.nodeDomMap.get(nodeId)
        if (!dom) return

        dom.remove()
        this.nodeDomMap.delete(nodeId)
    }

    public moveNode(nodeId: string) {
        const node = this.editor.getNode(nodeId)
        if (!node) return

        const dom = this.nodeDomMap.get(nodeId)
        const parentDom = this.nodeDomMap.get(node.parent!)

        if (!dom || !parentDom) return

        parentDom.appendChild(dom)
    }

    public updateNodeStyles(nodeId: string) {
        const node = this.editor.getNode(nodeId)
        const dom = this.nodeDomMap.get(nodeId)

        if (!node || !dom) return

        Object.entries(node.styles || {}).forEach(([key, value]) => {
            if (dom.style.getPropertyValue(key) !== value) {
                dom.style.setProperty(key, value)
            }
        })
    }

    public applyStyles(dom: HTMLElement, node: EditorNode) {
        const styles = node.styles || {}

        Object.entries(styles).forEach(([key, value]) => {
            dom.style.setProperty(key, value)
        })
    }

    public getDom(nodeId: string) {
        return this.nodeDomMap.get(nodeId)
    }

    public destroy() {
        this.unsubscribe?.()
        this.nodeDomMap.clear()
    }
}
