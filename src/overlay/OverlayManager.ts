import { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'

import { defaultOverlayConfig } from './defaultOverlayConfig'

import { OverlayLayoutEngine } from './OverlayLayoutEngine'
import { OverlayRenderer } from './OverlayRenderer'
import { LayoutSnapshotEngine } from './LayoutSnapshotEngine'
import { OverlayBarFactory } from './OverlayBarFactory'

import type { OverlayBarInstance } from './OverlayTypes'
import type { OverlayBorderStyle } from './OverlatConfig'

export class OverlayManager {
    public overlayRoot!: HTMLElement

    public hoverBox!: HTMLElement
    public selectionBox!: HTMLElement

    private barInstances = new Map<string, OverlayBarInstance>()

    private layout!: OverlayLayoutEngine
    private rendererUI!: OverlayRenderer
    private snapshotEngine!: LayoutSnapshotEngine

    private overlayBarFactory!: OverlayBarFactory

    private rafId: number | null = null

    private lastNodeId: string | null = null

    constructor(public editor: Editor, public renderer: IframeRenderer) {}

    public mount(container: HTMLElement) {
        this.overlayRoot = container
        this.overlayRoot.innerHTML = ''

        this.overlayRoot.style.position = 'absolute'
        this.overlayRoot.style.inset = '0'
        this.overlayRoot.style.pointerEvents = 'none'

        this.createBoxes()

        this.overlayBarFactory = new OverlayBarFactory(defaultOverlayConfig, this.overlayRoot, this.barInstances)

        this.overlayBarFactory.createBars()

        this.snapshotEngine = new LayoutSnapshotEngine(
            this.editor.nodeDomRegistry,
            this.renderer.iframe,
            this.overlayRoot,
        )

        this.layout = new OverlayLayoutEngine(defaultOverlayConfig, this.overlayRoot, this.barInstances)

        this.rendererUI = new OverlayRenderer(this.hoverBox, this.selectionBox, this.barInstances)

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

            this.rendererUI.render(layout)

            this.rafId = requestAnimationFrame(loop)
        }

        loop()
    }

    private createBoxes() {
        const create = ({ width, style, color }: OverlayBorderStyle) => {
            const el = document.createElement('div')

            el.style.position = 'absolute'
            el.style.pointerEvents = 'none'
            el.style.boxSizing = 'border-box'
            el.style.zIndex = '99999'

            const border = `${width}px ${style} ${color}`
            el.style.border = border

            this.overlayRoot.appendChild(el)

            return el
        }

        this.hoverBox = create(defaultOverlayConfig.hover)
        this.selectionBox = create(defaultOverlayConfig.selection)

        this.hoverBox.style.zIndex = '9999'
        this.selectionBox.style.zIndex = '999'
    }

    public destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId)
    }
}
