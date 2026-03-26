import { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'

import { defaultOverlayConfig } from './defaultOverlayConfig'

import { OverlayLayoutEngine } from './OverlayLayoutEngine'
import { LayoutSnapshotEngine } from './LayoutSnapshotEngine'

import { OverlayBox } from './elements/OverlayBox'
import { OverlayLayer } from './elements/OverlayLayer'
import { EmptySlotRenderer } from './EmptySlotRenderer'

export class OverlayManager {
    public overlayRoot!: HTMLElement

    private hoverLayer!: OverlayLayer
    private selectionLayer!: OverlayLayer

    public hoverBox!: OverlayBox
    public selectionBox!: OverlayBox

    private layout!: OverlayLayoutEngine
    private snapshotEngine!: LayoutSnapshotEngine
    private emptySlotRenderer!: EmptySlotRenderer

    private rafId: number | null = null

    constructor(public editor: Editor, public iframeRenderer: IframeRenderer) {}

    public mount(container: HTMLElement) {
        this.overlayRoot = container
        this.overlayRoot.id = 'fold-canvas-overlay'
        this.overlayRoot.innerHTML = ''

        this.overlayRoot.style.position = 'absolute'
        this.overlayRoot.style.inset = '0'
        this.overlayRoot.style.pointerEvents = 'none'

        this.hoverLayer = new OverlayLayer(this.overlayRoot, defaultOverlayConfig, 'hover')
        this.selectionLayer = new OverlayLayer(this.overlayRoot, defaultOverlayConfig, 'selection')

        this.snapshotEngine = new LayoutSnapshotEngine(
            this.editor.nodeDomRegistry,
            this.iframeRenderer.iframe,
            this.overlayRoot,
        )

        this.layout = new OverlayLayoutEngine(defaultOverlayConfig, this.overlayRoot)

        this.emptySlotRenderer = new EmptySlotRenderer(this.editor, this.overlayRoot)

        this.startLoop()
    }

    private startLoop() {
        const loop = () => {
            const snapshot = this.snapshotEngine.capture()

            const hoveredId = this.editor.state.hoveredId
            const selectedId = [...this.editor.state.selectedIds][0]

            const effectiveHoverId = hoveredId && hoveredId !== selectedId ? hoveredId : undefined

            const hoveredNode = effectiveHoverId ? this.editor.getNode(effectiveHoverId) : undefined

            const selectedNode = selectedId ? this.editor.getNode(selectedId) : undefined

            this.hoverLayer.setNode(hoveredNode)
            this.selectionLayer.setNode(selectedNode)

            const sizes = new Map<string, { width: number; height: number }>()

            this.hoverLayer.bars.forEach((bar) => {
                sizes.set(`${bar.config.id}-hover`, bar.getSize())
            })

            this.selectionLayer.bars.forEach((bar) => {
                sizes.set(`${bar.config.id}-selection`, bar.getSize())
            })

            const layout = this.layout.compute(snapshot, effectiveHoverId, selectedId, sizes)

            this.hoverLayer.render(layout)
            this.selectionLayer.render(layout)

            // this.emptySlotRenderer.render()

            this.rafId = requestAnimationFrame(loop)
        }

        loop()
    }

    public destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId)
    }
}
