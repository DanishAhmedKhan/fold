import type { OverlayBox } from './elements/OverlayBox'
import type { OverlayBarInstance, OverlayLayout } from './OverlayTypes'

export class OverlayRenderer {
    constructor(
        private hoverBox: OverlayBox,
        private selectionBox: OverlayBox,
        private barInstances: Map<string, OverlayBarInstance>,
    ) {}

    public render(layout: OverlayLayout) {
        if (layout.hoverRect) this.hoverBox.show(layout.hoverRect)
        else this.hoverBox.hide()

        if (layout.selectionRect) this.selectionBox.show(layout.selectionRect)
        else this.selectionBox.hide()

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
}
