import type { OverlayBarInstance, OverlayLayout, Rect } from './OverlayTypes'

export class OverlayRenderer {
    constructor(
        private hoverBox: HTMLElement,
        private selectionBox: HTMLElement,
        private barInstances: Map<string, OverlayBarInstance>,
    ) {}

    public render(layout: OverlayLayout) {
        if (layout.hoverRect) this.showBox(this.hoverBox, layout.hoverRect)
        else this.hoverBox.style.display = 'none'

        if (layout.selectionRect) this.showBox(this.selectionBox, layout.selectionRect)
        else this.selectionBox.style.display = 'none'

        const map = new Map(layout.bars.map((b) => [b.id, b]))

        for (const instance of this.barInstances.values()) {
            const bar = map.get(instance.id)

            if (!bar) {
                instance.element.style.display = 'none'
                continue
            }

            instance.element.style.display = 'flex'

            instance.element.style.transform = `translate3d(${bar.x}px,${bar.y}px,0)`
        }
    }

    private showBox(el: HTMLElement, rect: Rect) {
        el.style.display = 'block'

        el.style.transform = `translate3d(${rect.left}px,${rect.top}px,0)`

        el.style.width = rect.width + 'px'
        el.style.height = rect.height + 'px'
    }
}
