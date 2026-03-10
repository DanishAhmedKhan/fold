import type { OverlayLayout, Rect } from './OverlayTypes'

export class OverlayRenderer {
    constructor(
        private hoverBox: HTMLElement,
        private selectionBox: HTMLElement,
        private actionBar: HTMLElement,
        private elementLabel: HTMLElement,
        private addButton: HTMLElement,
    ) {}

    public render(layout: OverlayLayout) {
        if (layout.hoverRect) {
            this.showBox(this.hoverBox, layout.hoverRect)
        } else {
            this.hoverBox.style.display = 'none'
        }

        if (layout.selectionRect) {
            this.showBox(this.selectionBox, layout.selectionRect)
        } else {
            this.selectionBox.style.display = 'none'
        }

        if (layout.actionBar) {
            this.actionBar.style.display = 'flex'
            this.actionBar.style.left = layout.actionBar.x + 'px'
            this.actionBar.style.top = layout.actionBar.y + 'px'
        } else {
            this.actionBar.style.display = 'none'
        }

        if (layout.label) {
            this.elementLabel.style.display = 'block'
            this.elementLabel.textContent = layout.label.text
            this.elementLabel.style.left = layout.label.rect.left + 'px'
            this.elementLabel.style.top = layout.label.rect.top - 20 + 'px'
        } else {
            this.elementLabel.style.display = 'none'
        }

        if (layout.addButton) {
            const rect = layout.addButton

            this.addButton.style.display = 'flex'
            this.addButton.style.left = rect.left + rect.width / 2 - 9 + 'px'
            this.addButton.style.top = rect.bottom - 9 + 'px'
        } else {
            this.addButton.style.display = 'none'
        }
    }

    private showBox(el: HTMLElement, rect: Rect) {
        el.style.display = 'block'

        el.style.left = rect.left + 'px'
        el.style.top = rect.top + 'px'
        el.style.width = rect.width + 'px'
        el.style.height = rect.height + 'px'
    }
}
