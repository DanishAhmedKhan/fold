import { BuiltInElements } from '../elements/defaultElements'
import { ElementRegistry } from '../elements/ElementRegistry'
import type { EditorElement } from '../elements/EditorElement'
import { generateId } from '../helper/generateId'
import { NodeDOMRegistry } from '../overlay/NodeDomRegistry'
import { PropertyControlRegistry } from '../properties/PropertyControlRegistry'
import { PropertyManager } from '../properties/PropertyManager'
import type { EditorPatch } from './EditorPatch'
import { EditorStore } from './EditorStore'
import type { EditorNode, ResponsiveStyles } from './types'

const VIEWPORT_STORAGE_KEY = 'fold-editor-viewport-device'

export class Editor {
    public store: EditorStore

    public elementRegistry: ElementRegistry
    public nodeDomRegistry: NodeDOMRegistry

    public properties: PropertyManager
    public controls: PropertyControlRegistry

    constructor() {
        this.store = new EditorStore()
        this.elementRegistry = new ElementRegistry()
        this.nodeDomRegistry = new NodeDOMRegistry()

        this.controls = new PropertyControlRegistry()
        this.properties = new PropertyManager(this)

        this.restoreViewportDevice()

        for (const elements of BuiltInElements) {
            this.registerElement(elements)
        }
    }

    get state() {
        return this.store.state
    }

    public getNode(id: string): EditorNode | undefined {
        return this.state.nodes[id]
    }

    public addNode(type: string, parentId: string, silent = false) {
        const element = this.elementRegistry.get(type)
        if (!element) throw new Error('Element not registered: ' + type)

        const id = generateId()
        // const defaults = element.create()
        const defaults = element.create ? element.create() : {}

        const node: EditorNode = {
            id,
            type,
            parent: parentId,
            children: [],
            props: defaults.props ?? {},
            styles: defaults.styles ?? {},
        }

        this.state.nodes[id] = node

        const parentNode = this.state.nodes[parentId]
        parentNode.children.push(id)

        if (defaults.children?.length) {
            defaults.children.forEach((childType: string) => {
                this.addNode(childType, id, true)
            })
        }

        if (!silent) {
            this.store.emit({ type: 'ADD_NODE', nodeId: id })
        }

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

    public updateStyle(nodeId: string, device: keyof ResponsiveStyles, key: string, value: string) {
        const node = this.state.nodes[nodeId]
        if (!node) return

        if (!node.styles[device]) {
            node.styles[device] = {}
        }

        node.styles[device]![key] = value

        this.store.emit({ type: 'UPDATE_STYLE', nodeId })
    }

    public removeStyle(nodeId: string, key: string) {
        const node = this.state.nodes[nodeId]
        if (!node) return

        const device = this.state.viewport.device as keyof ResponsiveStyles

        const styles = node.styles[device]
        if (!styles) return

        delete styles[key]

        this.store.emit({ type: 'REMOVE_STYLE', nodeId })
    }
    public updateProp(nodeId: string, key: string, value: string) {
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
        this.elementRegistry.register(element)
    }

    public setDevice(device: 'desktop' | 'tablet' | 'mobile') {
        const widths = {
            desktop: 1280,
            tablet: 768,
            mobile: 375,
        }

        this.state.viewport.device = device
        this.state.viewport.width = widths[device]

        localStorage.setItem(VIEWPORT_STORAGE_KEY, device)

        this.store.emit({ type: 'SET_DEVICE', device })
    }

    public setResponsiveMode() {
        this.state.viewport.device = 'responsive'

        localStorage.setItem(VIEWPORT_STORAGE_KEY, 'responsive')

        this.store.emit({ type: 'SET_DEVICE', device: 'responsive' })
    }

    public setCanvasWidth(width: number) {
        this.state.viewport.width = width
        this.store.emit({ type: 'SET_CANVAS_WIDTH', width })
    }

    private restoreViewportDevice() {
        const saved = localStorage.getItem(VIEWPORT_STORAGE_KEY)

        if (!saved) return

        if (saved === 'responsive') {
            this.setResponsiveMode()
            return
        }

        if (saved === 'desktop' || saved === 'tablet' || saved === 'mobile') {
            this.setDevice(saved)
        }
    }

    public setIsResizing(isResizing: boolean) {
        this.state.viewport.isResizing = isResizing
        this.store.emit({ type: 'SET_IS_RESIZING' })
    }
}
