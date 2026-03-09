import { Editor } from '../core/Editor'
import { IframeInteractionManager } from '../interaction/IframeInteractionManager'
import { iframeTemplate } from './iframeTemplate'
import type { EditorNode } from '../core/types'
import type { EditorPatch } from '../core/EditorPatch'

export class IframeRenderer {
    public editor: Editor
    public interaction!: IframeInteractionManager

    public iframe!: HTMLIFrameElement
    public doc!: Document
    public body!: HTMLElement

    public nodeDomMap = new Map<string, HTMLElement>()

    public unsubscribe?: () => void

    constructor(editor: Editor) {
        this.editor = editor
        this.interaction = new IframeInteractionManager(editor)
    }

    public mount(iframe: HTMLIFrameElement) {
        this.iframe = iframe

        iframe.style.visibility = 'hidden'

        const doc = iframe.contentDocument!

        doc.open()
        doc.write(iframeTemplate)
        doc.close()

        this.doc = doc
        this.body = doc.body

        this.renderInitialTree()
        this.subscribeToEditor()
        this.interaction.mount(doc)

        requestAnimationFrame(() => {
            iframe.style.visibility = 'visible'
        })
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

                case 'MOVE_NODE':
                    this.moveNode(patch.nodeId)
                    break

                case 'UPDATE_STYLE':
                    this.updateNodeStyles(patch.nodeId)
                    break

                case 'SELECT_NODE':
                case 'SELECT_NODES':
                case 'TOGGLE_NODE_SELECTION':
                case 'CLEAR_SELECTION':
                    break

                case 'HOVER_NODE':
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

    public applyStyles(el: HTMLElement, node: EditorNode) {
        const styles = node.styles || {}

        Object.entries(styles).forEach(([key, value]) => {
            el.style.setProperty(key, value)
        })
    }

    public getDom(nodeId: string) {
        return this.nodeDomMap.get(nodeId)
    }

    public destroy() {
        this.unsubscribe?.()
        this.nodeDomMap.clear()
        this.interaction.destroy()
    }
}
