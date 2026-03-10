import { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'
import { defaultOverlayConfig } from './defaultOverlayConfig'
import type { OverlayConfig } from './OverlatConfig'

import { OverlayLayoutEngine } from './OverlayLayoutEngine'
import { OverlayRenderer } from './OverlayRenderer'

export class OverlayManager {
    public overlayRoot!: HTMLElement

    public hoverBox!: HTMLElement
    public selectionBox!: HTMLElement
    public actionBar!: HTMLElement
    public elementLabel!: HTMLElement
    public addButton!: HTMLElement

    private layout!: OverlayLayoutEngine
    private rendererUI!: OverlayRenderer

    private rafId: number | null = null
    private needsUpdate = true
    private unsubscribe?: () => void

    private resizeObserver!: ResizeObserver
    private mutationObserver!: MutationObserver

    private lastActionNode?: string

    constructor(
        public editor: Editor,
        public renderer: IframeRenderer,
        public config: OverlayConfig = defaultOverlayConfig,
    ) {}

    public mount(container: HTMLElement) {
        this.overlayRoot = container

        this.overlayRoot.style.position = 'absolute'
        this.overlayRoot.style.inset = '0'
        this.overlayRoot.style.pointerEvents = 'none'

        this.createElements()

        this.layout = new OverlayLayoutEngine(this.editor, this.renderer, this.config, this.overlayRoot, this.actionBar)

        this.rendererUI = new OverlayRenderer(
            this.hoverBox,
            this.selectionBox,
            this.actionBar,
            this.elementLabel,
            this.addButton,
        )

        this.unsubscribe = this.editor.subscribe(() => this.requestUpdate())

        this.observeLayout()
        this.startLoop()
    }

    private startLoop() {
        const loop = () => {
            if (this.needsUpdate) {
                const selectedIds = this.editor.state.selectedIds

                if (selectedIds && selectedIds.size > 0) {
                    const id = [...selectedIds][0]

                    if (id !== this.lastActionNode) {
                        this.renderActions(id)
                        this.lastActionNode = id

                        this.actionBar.getBoundingClientRect()
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

    private createElements() {
        const create = () => {
            const el = document.createElement('div')
            el.style.position = 'absolute'
            el.style.pointerEvents = 'none'
            this.overlayRoot.appendChild(el)
            return el
        }

        this.hoverBox = create()
        this.selectionBox = create()

        this.hoverBox.style.border = '1px dashed #999'
        this.selectionBox.style.border = '2px solid #3b82f6'

        this.actionBar = document.createElement('div')
        this.actionBar.style.position = 'absolute'
        this.actionBar.style.display = 'none'
        this.actionBar.style.pointerEvents = 'auto'
        this.actionBar.style.background = 'rgb(59, 130, 246)'
        this.actionBar.style.padding = '2px 6px'
        this.actionBar.style.gap = '4px'
        this.actionBar.style.color = 'white'

        this.overlayRoot.appendChild(this.actionBar)

        this.elementLabel = create()
        this.addButton = create()

        this.addButton.style.width = '18px'
        this.addButton.style.height = '18px'
        this.addButton.style.color = 'white'
        this.addButton.style.background = 'rgb(59, 130, 246)'
        this.addButton.style.borderRadius = '50%'
        this.addButton.style.alignItems = 'center'
        this.addButton.style.justifyContent = 'center'
        this.addButton.style.cursor = 'pointer'
        this.addButton.style.pointerEvents = 'auto'
        this.addButton.textContent = '+'

        this.elementLabel.style.background = 'rgb(59, 130, 246)'
        this.elementLabel.style.padding = '1px 5px'
        this.elementLabel.style.color = 'white'
    }

    private renderActions(nodeId: string) {
        const actions = this.config.actionBar.actions

        this.actionBar.innerHTML = ''

        actions.forEach((action) => {
            const btn = document.createElement('button')

            btn.style.background = 'transparent'
            btn.style.border = 'none'
            btn.style.color = 'white'
            btn.style.cursor = 'pointer'
            btn.style.fontSize = '12px'
            btn.style.padding = '2px'

            if (typeof action.icon === 'string') {
                btn.textContent = action.icon
            } else {
                btn.appendChild(action.icon)
            }

            if (action.tooltip) {
                btn.title = action.tooltip
            }

            btn.onclick = (e) => {
                e.stopPropagation()
                action.onClick(this.editor, nodeId)
            }

            this.actionBar.appendChild(btn)
        })
    }

    public destroy() {
        this.unsubscribe?.()

        this.resizeObserver?.disconnect()
        this.mutationObserver?.disconnect()

        if (this.rafId) cancelAnimationFrame(this.rafId)
    }
}
