import { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'
import { defaultOverlayConfig } from './defaultOverlayConfig'
import type { OverlayConfig } from './OverlatConfig'

type Rect = {
    left: number
    top: number
    width: number
    height: number
    right: number
    bottom: number
}

export class OverlayManager {
    public editor: Editor
    public renderer: IframeRenderer
    public config: OverlayConfig

    public overlayRoot!: HTMLElement

    public hoverBox!: HTMLElement
    public selectionBox!: HTMLElement

    public actionBar!: HTMLElement
    public elementLabel!: HTMLElement
    public addButton!: HTMLElement

    private unsubscribe?: () => void

    private rafId: number | null = null
    private needsUpdate = true

    private resizeObserver!: ResizeObserver
    private mutationObserver!: MutationObserver

    constructor(editor: Editor, renderer: IframeRenderer, config?: Partial<OverlayConfig>) {
        this.editor = editor
        this.renderer = renderer
        this.config = { ...defaultOverlayConfig, ...config }
    }

    public mount(container: HTMLElement) {
        this.overlayRoot = container

        this.overlayRoot.style.position = 'absolute'
        this.overlayRoot.style.inset = '0'
        this.overlayRoot.style.pointerEvents = 'none'

        this.createHoverBox()
        this.createSelectionBox()
        this.createActionBar()
        this.createElementLabel()
        this.createAddButton()

        this.unsubscribe = this.editor.subscribe(() => this.requestUpdate())

        this.observeLayout()
        this.startLoop()
    }

    private startLoop() {
        const loop = () => {
            if (this.needsUpdate) {
                this.update()
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

        this.resizeObserver = new ResizeObserver(() => {
            this.requestUpdate()
        })

        this.resizeObserver.observe(this.renderer.body)

        this.mutationObserver = new MutationObserver(() => {
            this.requestUpdate()
        })

        this.mutationObserver.observe(this.renderer.body, {
            attributes: true,
            childList: true,
            subtree: true,
        })
    }

    public createHoverBox() {
        const el = document.createElement('div')

        el.style.position = 'absolute'
        el.style.pointerEvents = 'none'
        el.style.border = `1px dashed ${this.config.defaultHoverColor}`

        this.overlayRoot.appendChild(el)
        this.hoverBox = el
    }

    public createSelectionBox() {
        const el = document.createElement('div')

        el.style.position = 'absolute'
        el.style.pointerEvents = 'none'
        el.style.border = `2px solid ${this.config.defaultSelectionColor}`

        this.overlayRoot.appendChild(el)
        this.selectionBox = el
    }

    public createActionBar() {
        const bar = document.createElement('div')

        bar.style.position = 'absolute'
        bar.style.display = 'flex'
        bar.style.gap = '4px'
        bar.style.background = '#111'
        bar.style.color = 'white'
        bar.style.padding = '4px 6px'
        bar.style.fontSize = '12px'
        bar.style.borderRadius = '4px'

        this.overlayRoot.appendChild(bar)
        this.actionBar = bar
    }

    public createElementLabel() {
        const label = document.createElement('div')

        label.style.position = 'absolute'
        label.style.background = '#111'
        label.style.color = 'white'
        label.style.fontSize = '11px'
        label.style.padding = '2px 6px'
        label.style.borderRadius = '3px'

        this.overlayRoot.appendChild(label)
        this.elementLabel = label
    }

    public createAddButton() {
        const btn = document.createElement('div')

        btn.textContent = '+'

        btn.style.position = 'absolute'
        btn.style.background = '#3b82f6'
        btn.style.color = 'white'
        btn.style.width = '18px'
        btn.style.height = '18px'
        btn.style.display = 'flex'
        btn.style.alignItems = 'center'
        btn.style.justifyContent = 'center'
        btn.style.fontSize = '12px'
        btn.style.borderRadius = '50%'
        btn.style.cursor = 'pointer'
        btn.style.pointerEvents = 'auto'

        this.overlayRoot.appendChild(btn)
        this.addButton = btn
    }

    public update() {
        this.updateHover()
        this.updateSelection()
    }

    private updateHover() {
        const hovered = this.editor.state.hoveredId

        if (!hovered) {
            this.hoverBox.style.display = 'none'
            return
        }

        const dom = this.renderer.getDom(hovered)
        if (!dom) return

        const rect = this.getAbsoluteRect(dom)

        const node = this.editor.getNode(hovered)
        const elementConfig = this.config.elements?.[node?.type ?? '']

        const color = elementConfig?.hoverColor ?? this.config.defaultHoverColor

        this.hoverBox.style.display = 'block'
        this.hoverBox.style.borderColor = color

        this.positionBox(this.hoverBox, rect)
    }

    private updateSelection() {
        const selectedIds = this.editor.state.selectedIds

        if (!selectedIds || selectedIds.size === 0) {
            this.selectionBox.style.display = 'none'
            this.actionBar.style.display = 'none'
            this.elementLabel.style.display = 'none'
            this.addButton.style.display = 'none'
            return
        }

        const firstId = [...selectedIds][0]

        const dom = this.renderer.getDom(firstId)
        if (!dom) return

        const rect = this.getAbsoluteRect(dom)

        const node = this.editor.getNode(firstId)
        const elementConfig = this.config.elements?.[node?.type ?? '']

        const color = elementConfig?.selectionColor ?? this.config.defaultSelectionColor

        this.selectionBox.style.display = 'block'
        this.selectionBox.style.borderColor = color

        this.positionBox(this.selectionBox, rect)

        this.positionActionBar(rect)

        if (this.config.showElementName) {
            this.showElementLabel(node?.type ?? '', rect)
        }

        if (this.config.showAddButton) {
            this.showAddButton(rect)
        }
    }

    private getAbsoluteRect(dom: HTMLElement): Rect {
        const rect = dom.getBoundingClientRect()

        const iframeRect = this.renderer.iframe.getBoundingClientRect()
        const overlayRect = this.overlayRoot.getBoundingClientRect()

        const left = iframeRect.left + rect.left - overlayRect.left
        const top = iframeRect.top + rect.top - overlayRect.top

        return {
            left,
            top,
            width: rect.width,
            height: rect.height,
            right: left + rect.width,
            bottom: top + rect.height,
        }
    }

    private positionBox(el: HTMLElement, rect: Rect) {
        el.style.left = rect.left + 'px'
        el.style.top = rect.top + 'px'
        el.style.width = rect.width + 'px'
        el.style.height = rect.height + 'px'
    }

    private positionActionBar(rect: Rect) {
        const placement = this.config.actionBar.placement

        let x = rect.left
        let y = rect.top

        if (placement === 'top-right') {
            x = rect.right
            y = rect.top - 28
        }

        if (placement === 'top-left') {
            x = rect.left
            y = rect.top - 28
        }

        if (placement === 'bottom-right') {
            x = rect.right
            y = rect.bottom
        }

        if (placement === 'bottom-left') {
            x = rect.left
            y = rect.bottom
        }

        this.actionBar.style.display = 'flex'
        this.actionBar.style.left = x + 'px'
        this.actionBar.style.top = y + 'px'
    }

    private showElementLabel(name: string, rect: Rect) {
        this.elementLabel.style.display = 'block'

        this.elementLabel.textContent = name

        this.elementLabel.style.left = rect.left + 'px'
        this.elementLabel.style.top = rect.top - 18 + 'px'
    }

    private showAddButton(rect: Rect) {
        this.addButton.style.display = 'flex'

        this.addButton.style.left = rect.left + rect.width / 2 - 9 + 'px'
        this.addButton.style.top = rect.bottom + 'px'
    }

    public destroy() {
        this.unsubscribe?.()

        this.resizeObserver?.disconnect()
        this.mutationObserver?.disconnect()

        if (this.rafId) cancelAnimationFrame(this.rafId)
    }
}
