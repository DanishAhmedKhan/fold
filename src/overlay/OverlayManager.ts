import { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'

import { defaultOverlayConfig } from './defaultOverlayConfig'

import { OverlayLayoutEngine } from './OverlayLayoutEngine'
import { OverlayRenderer } from './OverlayRenderer'
import { LayoutSnapshotEngine } from './LayoutSnapshotEngine'
import { OverlayBarFactory } from './OverlayBarFactory'

import type { OverlayBarInstance } from './OverlayTypes'

export class OverlayManager {
    public overlayRoot!: HTMLElement

    public hoverBox!: HTMLElement
    public selectionBox!: HTMLElement

    private barInstances = new Map<string, OverlayBarInstance>()

    private layout!: OverlayLayoutEngine
    private rendererUI!: OverlayRenderer
    private snapshotEngine!: LayoutSnapshotEngine

    private rafId: number | null = null

    constructor(public editor: Editor, public renderer: IframeRenderer) {}

    public mount(container: HTMLElement) {
        this.overlayRoot = container
        this.overlayRoot.innerHTML = ''

        this.overlayRoot.style.position = 'absolute'
        this.overlayRoot.style.inset = '0'
        this.overlayRoot.style.pointerEvents = 'none'

        this.createBoxes()

        const factory = new OverlayBarFactory(defaultOverlayConfig, this.overlayRoot, this.barInstances)

        factory.createBars()

        this.snapshotEngine = new LayoutSnapshotEngine(
            this.editor.nodeDomRegistry,
            this.renderer.iframe,
            this.overlayRoot,
        )

        this.layout = new OverlayLayoutEngine(defaultOverlayConfig, this.overlayRoot, this.barInstances)

        this.rendererUI = new OverlayRenderer(this.hoverBox, this.selectionBox, this.barInstances)

        this.startLoop()
    }

    private startLoop() {
        const loop = () => {
            const snapshot = this.snapshotEngine.capture()

            const hovered = this.editor.state.hoveredId
            const selected = [...this.editor.state.selectedIds][0]

            const layout = this.layout.compute(snapshot, hovered, selected)

            this.rendererUI.render(layout)

            this.rafId = requestAnimationFrame(loop)
        }

        loop()
    }

    private createBoxes() {
        const create = () => {
            const el = document.createElement('div')

            el.style.position = 'absolute'
            el.style.pointerEvents = 'none'
            el.style.boxSizing = 'border-box'

            this.overlayRoot.appendChild(el)

            return el
        }

        this.hoverBox = create()
        this.selectionBox = create()

        this.hoverBox.style.border = '1px dashed #999'
        this.selectionBox.style.border = '2px solid #3b82f6'
    }

    destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId)
    }
}
