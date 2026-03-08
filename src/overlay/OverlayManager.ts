import { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'

export class OverlayManager {
    editor: Editor
    renderer: IframeRenderer

    overlayRoot!: HTMLElement
    selectionBox!: HTMLElement

    unsubscribe?: () => void

    constructor(editor: Editor, renderer: IframeRenderer) {
        this.editor = editor
        this.renderer = renderer
    }

    mount(container: HTMLElement) {
        this.overlayRoot = container

        this.createSelectionBox()

        this.unsubscribe = this.editor.subscribe(() => {
            this.update()
        })

        window.addEventListener('scroll', () => this.update())
        window.addEventListener('resize', () => this.update())
    }

    createSelectionBox() {
        const box = document.createElement('div')

        box.style.position = 'absolute'
        box.style.border = '2px solid #3b82f6'
        box.style.pointerEvents = 'none'
        box.style.zIndex = '9999'

        this.overlayRoot.appendChild(box)

        this.selectionBox = box
    }

    update() {
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
