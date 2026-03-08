import { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'
import { defaultOverlayConfig } from './defaultOverlayConfig'
import type { OverlayConfig } from './OverlatConfig'

export class OverlayManager {
    editor: Editor
    renderer: IframeRenderer

    config: OverlayConfig

    overlayRoot!: HTMLElement

    hoverBox!: HTMLElement
    selectionBox!: HTMLElement

    actionBar!: HTMLElement
    elementLabel!: HTMLElement
    addButton!: HTMLElement

    unsubscribe?: () => void

    constructor(editor: Editor, renderer: IframeRenderer, config?: Partial<OverlayConfig>) {
        this.editor = editor
        this.renderer = renderer

        this.config = { ...defaultOverlayConfig, ...config }
    }

    mount(container: HTMLElement) {
        this.overlayRoot = container

        this.overlayRoot.style.position = 'absolute'
        this.overlayRoot.style.left = '0'
        this.overlayRoot.style.top = '0'
        this.overlayRoot.style.pointerEvents = 'none'

        this.createHoverBox()
        this.createSelectionBox()
        this.createActionBar()
        this.createElementLabel()
        this.createAddButton()

        this.unsubscribe = this.editor.subscribe(() => this.update())

        window.addEventListener('scroll', () => this.update())
        window.addEventListener('resize', () => this.update())
    }

    createHoverBox() {
        const el = document.createElement('div')

        el.style.position = 'absolute'
        el.style.pointerEvents = 'none'
        el.style.border = `1px dashed ${this.config.defaultHoverColor}`

        this.overlayRoot.appendChild(el)

        this.hoverBox = el
    }

    createSelectionBox() {
        const el = document.createElement('div')

        el.style.position = 'absolute'
        el.style.pointerEvents = 'none'
        el.style.border = `2px solid ${this.config.defaultSelectionColor}`

        this.overlayRoot.appendChild(el)

        this.selectionBox = el
    }

    createActionBar() {
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

    createElementLabel() {
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

    createAddButton() {
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

    update() {
        this.updateHover()
        this.updateSelection()
    }

    updateHover() {
        const hovered = this.editor.state.hoveredId

        if (!hovered) {
            this.hoverBox.style.display = 'none'
            return
        }

        const dom = this.renderer.getDom(hovered)
        if (!dom) return

        const rect = dom.getBoundingClientRect()

        const node = this.editor.getNode(hovered)

        const elementConfig = this.config.elements?.[node?.type ?? '']

        const color = elementConfig?.hoverColor ?? this.config.defaultHoverColor

        this.hoverBox.style.display = 'block'
        this.hoverBox.style.borderColor = color

        this.positionBox(this.hoverBox, rect)
    }

    updateSelection() {
        const selected = this.editor.state.selectedId

        if (!selected) {
            this.selectionBox.style.display = 'none'
            this.actionBar.style.display = 'none'
            this.elementLabel.style.display = 'none'
            this.addButton.style.display = 'none'
            return
        }

        const dom = this.renderer.getDom(selected)
        if (!dom) return

        const rect = dom.getBoundingClientRect()

        const node = this.editor.getNode(selected)

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

    positionBox(el: HTMLElement, rect: DOMRect) {
        el.style.left = rect.left + 'px'
        el.style.top = rect.top + 'px'
        el.style.width = rect.width + 'px'
        el.style.height = rect.height + 'px'
    }

    positionActionBar(rect: DOMRect) {
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

    showElementLabel(name: string, rect: DOMRect) {
        this.elementLabel.style.display = 'block'

        this.elementLabel.textContent = name

        this.elementLabel.style.left = rect.left + 'px'
        this.elementLabel.style.top = rect.top - 18 + 'px'
    }

    showAddButton(rect: DOMRect) {
        this.addButton.style.display = 'flex'

        this.addButton.style.left = rect.left + rect.width / 2 - 9 + 'px'
        this.addButton.style.top = rect.bottom + 'px'
    }
}
