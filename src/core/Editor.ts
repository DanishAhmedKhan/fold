import { ElementRegistry } from '../elements/ElementRegistry'
import type { EditorElement } from '../elements/types'
import { EditorStore } from './EditorStore'
import type { EditorNode } from './types'

export class Editor {
    store: EditorStore

    registry = new ElementRegistry()

    constructor() {
        this.store = new EditorStore()
    }

    get state() {
        return this.store.state
    }

    public getNode(id: string): EditorNode | undefined {
        return this.state.nodes[id]
    }

    public generateId() {
        return 'node_' + Math.random().toString(36).slice(2, 9)
    }

    public addNode(type: string, parentId: string) {
        const element = this.registry.get(type)
        if (!element) throw new Error('Element not registered: ' + type)

        const id = this.generateId()

        const defaults = element.create()

        const node = {
            id,
            type,
            parent: parentId,
            children: [],
            props: defaults.props ?? {},
            styles: defaults.styles ?? {},
        }

        this.state.nodes[id] = node

        const parent = this.state.nodes[parentId]
        parent.children.push(id)

        this.store.emit({ type: 'ADD_NODE', nodeId: id })

        return node
    }

    public deleteNode(nodeId: string) {
        const node = this.state.nodes[nodeId]
        if (!node) return

        const parentId = node.parent

        if (parentId) {
            const parent = this.state.nodes[parentId]
            parent.children = parent.children.filter((id) => id !== nodeId)
        }

        this.deleteSubtree(nodeId)

        this.store.emit({ type: 'REMOVE_NODE', nodeId })
    }

    private deleteSubtree(nodeId: string) {
        const node = this.state.nodes[nodeId]

        if (!node) return

        node.children.forEach((childId) => {
            this.deleteSubtree(childId)
        })

        delete this.state.nodes[nodeId]
    }

    public updateStyle(nodeId: string, key: string, value: string) {
        const node = this.state.nodes[nodeId]
        if (!node) return

        node.styles[key] = value

        this.store.emit({ type: 'UPDATE_STYLE', nodeId })
    }

    public removeStyle(nodeId: string, key: string) {
        const node = this.state.nodes[nodeId]

        if (!node) return

        delete node.styles[key]

        this.store.emit()
    }

    public updateProp(nodeId: string, key: string, value: unknown) {
        const node = this.state.nodes[nodeId]

        if (!node) return

        node.props[key] = value

        this.store.emit()
    }

    public selectNode(nodeId: string | null) {
        this.state.selectedId = nodeId ?? undefined

        this.store.emit({ type: 'SELECT_NODE', nodeId })
    }

    public hoverNode(nodeId: string | null) {
        this.state.hoveredId = nodeId ?? undefined

        this.store.emit({ type: 'HOVER_NODE', nodeId })
    }

    public clearHover() {
        if (!this.state.hoveredId) return

        this.state.hoveredId = undefined
        this.store.emit()
    }

    public moveNode(nodeId: string, newParentId: string, index?: number) {
        const node = this.state.nodes[nodeId]

        if (!node) return

        const oldParentId = node.parent

        if (oldParentId) {
            const oldParent = this.state.nodes[oldParentId]

            oldParent.children = oldParent.children.filter((id) => id !== nodeId)
        }

        const newParent = this.state.nodes[newParentId]

        if (!newParent) {
            throw new Error('New parent not found')
        }

        node.parent = newParentId

        if (index === undefined) {
            newParent.children.push(nodeId)
        } else {
            newParent.children.splice(index, 0, nodeId)
        }

        this.store.emit()
    }

    public subscribe(listener: () => void) {
        return this.store.subscribe(listener)
    }

    public registerElement(element: EditorElement) {
        this.registry.register(element)
    }
}
