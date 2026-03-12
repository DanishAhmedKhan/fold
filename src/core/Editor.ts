import { ElementRegistry } from '../elements/ElementRegistry'
import type { EditorElement } from '../elements/types'
import { generateId } from '../helper/generateId'
import type { EditorPatch } from './EditorPatch'
import { EditorStore } from './EditorStore'
import type { EditorNode } from './types'

export class Editor {
    public store: EditorStore
    public registry

    constructor() {
        this.store = new EditorStore()
        this.registry = new ElementRegistry()
    }

    get state() {
        return this.store.state
    }

    public getNode(id: string): EditorNode | undefined {
        return this.state.nodes[id]
    }

    public addNode(type: string, parentId: string) {
        const element = this.registry.get(type)
        if (!element) throw new Error('Element not registered: ' + type)

        const id = generateId()

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

        this.store.emit({ type: 'REMOVE_STYLE', nodeId })
    }

    public updateProp(nodeId: string, key: string, value: unknown) {
        const node = this.state.nodes[nodeId]
        if (!node) return

        node.props[key] = value

        this.store.emit({ type: 'UPDATE_PROPS', nodeId })
    }

    public selectNode(nodeId: string) {
        this.state.selectedIds.clear()
        this.state.selectedIds.add(nodeId)
        this.store.emit({ type: 'SELECT_NODE', nodeId })
    }

    toggleSelectNode(nodeId: string) {
        const selected = this.store.state.selectedIds

        if (selected.has(nodeId)) {
            selected.delete(nodeId)
        } else {
            selected.add(nodeId)
        }

        this.store.emit({ type: 'TOGGLE_NODE_SELECTION', nodeId })
    }

    public clearSelection() {
        this.state.selectedIds.clear()
        this.store.emit({ type: 'CLEAR_SELECTION' })
    }

    public selectMultiple(nodeIds: string[]) {
        this.state.selectedIds = new Set(nodeIds)
        this.store.emit({ type: 'SELECT_NODES', nodeIds })
    }

    public hoverNode(nodeId: string | null) {
        this.state.hoveredId = nodeId ?? undefined

        this.store.emit({ type: 'HOVER_NODE', nodeId })
    }

    public clearHover() {
        if (!this.state.hoveredId) return

        this.state.hoveredId = undefined
        this.store.emit({ type: 'CLEAR_HOVER' })
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

        this.store.emit({ type: 'MOVE_NODE', nodeId })
    }

    public subscribe(listener: (patch: EditorPatch) => void) {
        return this.store.subscribe(listener)
    }

    public registerElement(element: EditorElement) {
        this.registry.register(element)
    }

    public setDevice(device: 'desktop' | 'tablet' | 'mobile') {
        const widths = {
            desktop: 1280,
            tablet: 768,
            mobile: 375,
        }

        this.state.viewport.device = device
        this.state.viewport.width = widths[device]

        this.store.emit({ type: 'SET_DEVICE', device })
    }

    public setResponsiveMode() {
        this.state.viewport.device = 'responsive'
        this.store.emit({ type: 'SET_DEVICE', device: 'responsive' })
    }

    public setCanvasWidth(width: number) {
        this.state.viewport.width = width
        this.store.emit({ type: 'SET_CANVAS_WIDTH', width })
    }

    public setIsResizing(isResizing: boolean) {
        this.state.viewport.isResizing = isResizing
        this.store.emit({ type: 'SET_IS_RESIZING' })
    }
}
