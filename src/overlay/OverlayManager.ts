import { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'

import { defaultOverlayConfig } from './defaultOverlayConfig'
import type { OverlayAction, OverlayBorderStyle, OverlayConfig } from './OverlatConfig'

import { OverlayLayoutEngine } from './OverlayLayoutEngine'
import { OverlayRenderer } from './OverlayRenderer'

export class OverlayManager {
    public overlayRoot!: HTMLElement

    public hoverBox!: HTMLElement
    public selectionBox!: HTMLElement

    private bars = new Map<string, HTMLElement>()

    private layout!: OverlayLayoutEngine
    private rendererUI!: OverlayRenderer

    private rafId: number | null = null
    private needsUpdate = true
    private unsubscribe?: () => void

    private resizeObserver!: ResizeObserver
    private mutationObserver!: MutationObserver

    private lastNode?: string

    constructor(
        public editor: Editor,
        public renderer: IframeRenderer,
        public config: OverlayConfig = defaultOverlayConfig,
    ) {}

    public mount(container: HTMLElement) {
        this.overlayRoot = container
        this.overlayRoot.innerHTML = ''

        this.bars.clear()

        this.overlayRoot.style.position = 'absolute'
        this.overlayRoot.style.inset = '0'
        this.overlayRoot.style.pointerEvents = 'none'

        this.createBoxes()
        this.createBars()

        this.layout = new OverlayLayoutEngine(this.editor, this.renderer, this.config, this.overlayRoot, this.bars)

        this.rendererUI = new OverlayRenderer(this.hoverBox, this.selectionBox, this.bars)

        this.unsubscribe = this.editor.subscribe(() => this.requestUpdate())

        this.observeLayout()
        this.startLoop()
    }

    private createBoxes() {
        const create = (border?: OverlayBorderStyle) => {
            const el = document.createElement('div')
            el.style.position = 'absolute'
            el.style.pointerEvents = 'none'

            if (border) {
                el.style.borderColor = border.color || ''
                el.style.borderStyle = border.style!
                el.style.borderWidth = border.width! + 'px'
            }

            this.overlayRoot.appendChild(el)
            return el
        }

        this.hoverBox = create(defaultOverlayConfig.hover)
        this.selectionBox = create(defaultOverlayConfig.selection)
    }

    private createBars() {
        for (const bar of this.config.bars) {
            const el = document.createElement('div')

            el.style.position = 'absolute'
            el.style.pointerEvents = 'auto'
            el.style.display = 'none'

            // el.style.background = 'rgb(59,130,246)'
            el.style.background = 'red'
            el.style.color = 'white'

            el.style.padding = '2px 6px'
            el.style.gap = '4px'

            el.style.borderRadius = '4px'
            el.style.fontSize = '12px'

            if (bar.orientation === 'vertical') {
                el.style.flexDirection = 'column'
                el.style.display = 'flex'
            } else {
                el.style.flexDirection = 'row'
            }

            this.overlayRoot.appendChild(el)

            this.bars.set(bar.id, el)
        }
    }

    private startLoop() {
        const loop = () => {
            if (this.needsUpdate) {
                const selectedIds = this.editor.state.selectedIds

                if (selectedIds && selectedIds.size > 0) {
                    const nodeId = [...selectedIds][0]

                    if (nodeId !== this.lastNode) {
                        this.renderBarActions(nodeId)

                        this.lastNode = nodeId
                    }
                }

                const layout = this.layout.compute()

                this.rendererUI.render(layout)

                this.needsUpdate = false
            }

            this.rafId = requestAnimationFrame(loop)
        }

        loop()
    }

    private renderBarActions(nodeId: string) {
        for (const barConfig of this.config.bars) {
            const el = this.bars.get(barConfig.id)!
            const actions = barConfig.actions ?? []

            el.innerHTML = ''

            actions.forEach((action) => {
                const btn = this.createActionElement(action, nodeId)

                el.appendChild(btn)
            })
        }
    }

    private createActionElement(action: OverlayAction, nodeId: string) {
        const btn = document.createElement('button')

        btn.style.background = 'transparent'
        btn.style.border = 'none'
        btn.style.color = 'white'
        btn.style.cursor = 'pointer'
        btn.style.fontSize = '12px'
        btn.style.padding = '2px'

        if (action.icon) {
            if (typeof action.icon === 'string') {
                btn.textContent = action.icon
            } else {
                btn.appendChild(action.icon)
            }
        } else if (action.label) {
            btn.textContent = action.label
        }

        if (action.tooltip) {
            btn.title = action.tooltip
        }

        btn.onclick = (e) => {
            e.stopPropagation()

            action.onClick?.(this.editor, nodeId)
        }

        return btn
    }

    public requestUpdate() {
        this.needsUpdate = true
    }

    private observeLayout() {
        const doc = this.renderer.doc

        doc.addEventListener('scroll', () => this.requestUpdate(), true)

        window.addEventListener('resize', () => this.requestUpdate())

        this.resizeObserver = new ResizeObserver(() => this.requestUpdate())
        this.resizeObserver.observe(this.renderer.body)

        this.mutationObserver = new MutationObserver(() => this.requestUpdate())

        this.mutationObserver.observe(this.renderer.body, {
            attributes: true,
            childList: true,
            subtree: true,
        })
    }

    public destroy() {
        this.unsubscribe?.()

        this.resizeObserver?.disconnect()
        this.mutationObserver?.disconnect()

        if (this.rafId) cancelAnimationFrame(this.rafId)
    }
}
