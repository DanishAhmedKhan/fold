import { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'

import { defaultOverlayConfig } from './defaultOverlayConfig'

import { OverlayLayoutEngine } from './OverlayLayoutEngine'
import { OverlayRenderer } from './OverlayRenderer'
import { LayoutSnapshotEngine } from './LayoutSnapshotEngine'
import { OverlayBarFactory } from './OverlayBarFactory'

import type { OverlayBarInstance } from './OverlayTypes'
import { OverlayBox } from './elements/OverlayBox'
import { OverlayLayer } from './elements/OverlayLayer'

export type OverlayMode = 'hover' | 'selection'

export class OverlayManager {
    public overlayRoot!: HTMLElement

    private hoverLayer!: OverlayLayer
    private selectionLayer!: OverlayLayer

    public hoverBox!: OverlayBox
    public selectionBox!: OverlayBox

    private barInstances = new Map<string, OverlayBarInstance>()

    private layout!: OverlayLayoutEngine
    private renderer!: OverlayRenderer
    private snapshotEngine!: LayoutSnapshotEngine

    private overlayBarFactory!: OverlayBarFactory

    private rafId: number | null = null

    private lastNodeId: string | null = null

    constructor(public editor: Editor, public iframeRenderer: IframeRenderer) {}

    public mount(container: HTMLElement) {
        this.overlayRoot = container
        this.overlayRoot.innerHTML = ''

        this.overlayRoot.style.position = 'absolute'
        this.overlayRoot.style.inset = '0'
        this.overlayRoot.style.pointerEvents = 'none'

        this.hoverLayer = new OverlayLayer(this.overlayRoot, defaultOverlayConfig, 'hover')
        this.selectionLayer = new OverlayLayer(this.overlayRoot, defaultOverlayConfig, 'selection')

        this.hoverBox = new OverlayBox(this.overlayRoot, 'hover', defaultOverlayConfig.hover)
        this.selectionBox = new OverlayBox(this.overlayRoot, 'seletion', defaultOverlayConfig.selection)

        this.overlayBarFactory = new OverlayBarFactory(defaultOverlayConfig, this.overlayRoot, this.barInstances)

        this.overlayBarFactory.createBars()

        this.snapshotEngine = new LayoutSnapshotEngine(
            this.editor.nodeDomRegistry,
            this.iframeRenderer.iframe,
            this.overlayRoot,
        )

        this.layout = new OverlayLayoutEngine(defaultOverlayConfig, this.overlayRoot, this.barInstances)

        this.renderer = new OverlayRenderer(this.hoverBox, this.selectionBox, this.barInstances)

        this.startLoop()
    }

    // private startLoop() {
    //     const loop = () => {
    //         const snapshot = this.snapshotEngine.capture()

    //         const hovered = this.editor.state.hoveredId
    //         const selected = [...this.editor.state.selectedIds][0]

    //         const layout = this.layout.compute(snapshot, hovered, selected)

    //         this.rendererUI.render(layout)

    //         this.rafId = requestAnimationFrame(loop)
    //     }

    //     loop()
    // }

    // private startLoop() {
    //     const loop = () => {
    //         const snapshot = this.snapshotEngine.capture()

    //         const hovered = this.editor.state.hoveredId
    //         const selected = [...this.editor.state.selectedIds][0]

    //         const layout = this.layout.compute(snapshot, hovered, selected)

    //         const activeNodeId = hovered || selected

    //         if (activeNodeId && activeNodeId !== this.lastNodeId) {
    //             const node = this.editor.getNode(activeNodeId)
    //             if (node) {
    //                 this.overlayBarFactory.updateBarContent(node)
    //                 this.lastNodeId = activeNodeId
    //             }
    //         }

    //         this.renderer.render(layout)

    //         this.rafId = requestAnimationFrame(loop)
    //     }

    //     loop()
    // }

    private startLoop() {
        const loop = () => {
            const snapshot = this.snapshotEngine.capture()

            const hoveredId = this.editor.state.hoveredId
            const selectedId = [...this.editor.state.selectedIds][0]

            const layout = this.layout.compute(snapshot, hoveredId, selectedId)

            const hoveredNode = hoveredId ? this.editor.getNode(hoveredId) : undefined
            const selectedNode = selectedId ? this.editor.getNode(selectedId) : undefined

            this.hoverLayer.update(hoveredNode, layout)
            this.selectionLayer.update(selectedNode, layout)

            this.rafId = requestAnimationFrame(loop)
        }

        loop()
    }

    public destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId)
    }
}
