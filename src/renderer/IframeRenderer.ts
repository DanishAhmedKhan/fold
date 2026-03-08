import { Editor } from '../core/Editor'
import type { EditorNode } from '../core/types'

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
                            padding: 0;
                            min-height: 100vh;
                            box-sizing: border-box;
                            font-family: sans-serif;
                        }

                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }

                        body {
                            background: white;
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
        }
    }

    public subscribeToEditor() {
        this.unsubscribe = this.editor.subscribe(() => {
            this.sync()
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

    public applyStyles(dom: HTMLElement, node: EditorNode) {
        const styles = node.styles || {}

        Object.entries(styles).forEach(([key, value]) => {
            dom.style.setProperty(key, value)
        })
    }

    public sync() {
        const nodes = this.editor.state.nodes

        const currentIds = new Set(Object.keys(nodes))

        this.nodeDomMap.forEach((dom, id) => {
            if (!currentIds.has(id)) {
                dom.remove()

                this.nodeDomMap.delete(id)
            }
        })

        Object.values(nodes).forEach((node) => {
            if (!this.nodeDomMap.has(node.id)) {
                const parentId = node.parent

                if (!parentId) return

                const parentDom = this.nodeDomMap.get(parentId)

                if (!parentDom) return

                const dom = this.renderNode(node)

                parentDom.appendChild(dom)
            }
        })

        Object.values(nodes).forEach((node) => {
            const dom = this.nodeDomMap.get(node.id)

            if (!dom) return

            this.patchStyles(dom, node)
        })
    }

    public patchStyles(dom: HTMLElement, node: EditorNode) {
        const styles = node.styles || {}

        Object.entries(styles).forEach(([key, value]) => {
            if (dom.style.getPropertyValue(key) !== value) {
                dom.style.setProperty(key, value)
            }
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
