import { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'

export class OverlayManager {
    editor: Editor
    renderer: IframeRenderer

    overlayRoot!: HTMLElement

    selectionBox!: HTMLElement
    hoverBox!: HTMLElement

    unsubscribe?: () => void

    constructor(editor: Editor, renderer: IframeRenderer) {
        this.editor = editor
        this.renderer = renderer
    }

    mount(container: HTMLElement) {
        this.overlayRoot = container

        this.createBoxes()

        this.unsubscribe = this.editor.subscribe(() => {
            this.update()
        })

        window.addEventListener('scroll', () => this.update())
        window.addEventListener('resize', () => this.update())
    }

    createBoxes() {
        const hover = document.createElement('div')

        hover.style.position = 'absolute'
        hover.style.border = '1px dashed #999'
        hover.style.pointerEvents = 'none'

        this.overlayRoot.appendChild(hover)

        this.hoverBox = hover

        const selection = document.createElement('div')

        selection.style.position = 'absolute'
        selection.style.border = '2px solid #3b82f6'
        selection.style.pointerEvents = 'none'

        this.overlayRoot.appendChild(selection)

        this.selectionBox = selection
    }

    update() {
        this.updateHover()
        this.updateSelection()
    }

    updateHover() {
        const hovered = this.renderer.hoveredId

        if (!hovered) {
            this.hoverBox.style.display = 'none'
            return
        }

        const dom = this.renderer.getDom(hovered)

        if (!dom) return

        const rect = dom.getBoundingClientRect()

        this.hoverBox.style.display = 'block'

        this.hoverBox.style.left = rect.left + 'px'
        this.hoverBox.style.top = rect.top + 'px'
        this.hoverBox.style.width = rect.width + 'px'
        this.hoverBox.style.height = rect.height + 'px'
    }

    updateSelection() {
        const selectedId = this.editor.state.selectedId

        if (!selectedId) {
            this.selectionBox.style.display = 'none'
            return
        }

        const dom = this.renderer.getDom(selectedId)

        if (!dom) return

        const rect = dom.getBoundingClientRect()

        this.selectionBox.style.display = 'block'

        this.selectionBox.style.left = rect.left + 'px'
        this.selectionBox.style.top = rect.top + 'px'
        this.selectionBox.style.width = rect.width + 'px'
        this.selectionBox.style.height = rect.height + 'px'
    }
}
