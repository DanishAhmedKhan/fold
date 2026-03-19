import { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'

import { defaultOverlayConfig } from './defaultOverlayConfig'

import { OverlayLayoutEngine } from './OverlayLayoutEngine'
import { OverlayRenderer } from './OverlayRenderer'
import { LayoutSnapshotEngine } from './LayoutSnapshotEngine'
import { OverlayBarFactory } from './OverlayBarFactory'

import type { OverlayBarInstance } from './OverlayTypes'
import { OverlayBox } from './OverlayBox'

export class OverlayManager {
    public overlayRoot!: HTMLElement

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

        this.hoverBox = new OverlayBox(this.overlayRoot, defaultOverlayConfig.hover)
        this.selectionBox = new OverlayBox(this.overlayRoot, defaultOverlayConfig.selection)

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

    private startLoop() {
        const loop = () => {
            const snapshot = this.snapshotEngine.capture()

            const hovered = this.editor.state.hoveredId
            const selected = [...this.editor.state.selectedIds][0]

            const layout = this.layout.compute(snapshot, hovered, selected)

            const activeNodeId = hovered || selected

            if (activeNodeId && activeNodeId !== this.lastNodeId) {
                const node = this.editor.getNode(activeNodeId)
                if (node) {
                    this.overlayBarFactory.updateBarContent(node)
                    this.lastNodeId = activeNodeId
                }
            }

            this.renderer.render(layout)

            this.rafId = requestAnimationFrame(loop)
        }

        loop()
    }

    public destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId)
    }
}
