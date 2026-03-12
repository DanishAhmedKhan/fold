import type { OverlayLayout, Rect } from './OverlayTypes'

export class OverlayRenderer {
    constructor(
        private hoverBox: HTMLElement,
        private selectionBox: HTMLElement,
        private barElements: Map<string, HTMLElement>,
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

        for (const [id, el] of this.barElements) {
            const bar = layout.bars.find((b) => b.id === id)

            if (!bar) {
                el.style.display = 'none'
                continue
            }

            if (el.style.display === 'none') continue

            el.style.left = bar.x + 'px'
            el.style.top = bar.y + 'px'
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
