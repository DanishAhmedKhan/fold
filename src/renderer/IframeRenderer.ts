import { Editor } from '../core/Editor'
import { IframeInteractionManager } from '../interaction/IframeInteractionManager'
import { iframeTemplate } from './iframeTemplate'
import type { EditorNode } from '../core/types'
import type { EditorPatch } from '../core/EditorPatch'
import { OverlayInteractionManager } from '../interaction/OverlayInteractionManager'

export class IframeRenderer {
    public editor: Editor

    private overlayInteraction!: OverlayInteractionManager
    private builderInteraction!: IframeInteractionManager

    public iframe!: HTMLIFrameElement
    public doc!: Document
    public body!: HTMLElement

    // still needed for reverse lookup (DOM -> nodeId)
    public domNodeMap = new WeakMap<HTMLElement, string>()

    public unsubscribe?: () => void

    constructor(editor: Editor) {
        this.editor = editor

        this.overlayInteraction = new OverlayInteractionManager(editor, this.domNodeMap)
        this.builderInteraction = new IframeInteractionManager(editor)
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

        this.overlayInteraction.mount(this.doc)
        this.builderInteraction.mount(this.doc)

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
            }
        })
    }

    public renderInitialTree() {
        this.body.innerHTML = ''

        // clear registry on full render
        this.editor.nodeDomRegistry.clear()

        const root = this.editor.getNode(this.editor.state.rootId)
        if (!root) return

        const dom = this.renderNode(root)

        this.body.appendChild(dom)
    }

    public renderNode(node: EditorNode): HTMLElement {
        const element = this.editor.elementRegistry.get(node.type)

        const el = element ? element.render(this.doc, node) : this.doc.createElement('div')

        el.dataset.nodeId = node.id

        // register node DOM
        this.editor.nodeDomRegistry.register(node.id, el)

        // reverse lookup
        this.domNodeMap.set(el, node.id)

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

        const parentDom = this.editor.nodeDomRegistry.get(node.parent!)
        if (!parentDom) return

        const dom = this.renderNode(node)

        parentDom.appendChild(dom)
    }

    public unmountNode(nodeId: string) {
        const dom = this.editor.nodeDomRegistry.get(nodeId)
        if (!dom) return

        dom.remove()

        this.editor.nodeDomRegistry.unregister(nodeId)

        this.domNodeMap.delete(dom)
    }

    public moveNode(nodeId: string) {
        const node = this.editor.getNode(nodeId)
        if (!node) return

        const dom = this.editor.nodeDomRegistry.get(nodeId)
        const parentDom = this.editor.nodeDomRegistry.get(node.parent!)

        if (!dom || !parentDom) return

        parentDom.appendChild(dom)
    }

    public updateNodeStyles(nodeId: string) {
        const node = this.editor.getNode(nodeId)
        const dom = this.editor.nodeDomRegistry.get(nodeId)

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
        return this.editor.nodeDomRegistry.get(nodeId) ?? null
    }

    public destroy() {
        this.unsubscribe?.()

        this.editor.nodeDomRegistry.clear()

        this.overlayInteraction.destroy()
        this.builderInteraction.destroy()
    }
}
