import type { OverlayLayout, OverlayBarInstance, LayoutSnapshot, Rect } from './OverlayTypes'
import type { OverlayConfig, OverlayBarConfig } from './OverlatConfig'

export class OverlayLayoutEngine {
    constructor(
        private config: OverlayConfig,
        private overlayRoot: HTMLElement,
        private barInstances: Map<string, OverlayBarInstance>,
    ) {}

    compute(snapshot: LayoutSnapshot, hoveredId?: string, selectedId?: string): OverlayLayout {
        const layout: OverlayLayout = { bars: [] }

        const hoverRect = hoveredId ? snapshot.nodes.get(hoveredId) : undefined

        const selectionRect = selectedId ? snapshot.nodes.get(selectedId) : undefined

        layout.hoverRect = hoverRect
        layout.selectionRect = selectionRect

        const canvas = this.overlayRoot.getBoundingClientRect()

        for (const instance of this.barInstances.values()) {
            const rect = instance.mode === 'hover' ? hoverRect : selectionRect

            if (!rect) continue

            const bar = this.config.bars.find((b) => b.id === instance.barId)
            if (!bar) continue

            const pos = this.computeBar(bar, rect, instance, canvas)

            layout.bars.push({
                id: instance.id,
                x: pos.x,
                y: pos.y,
            })
        }

        return layout
    }

    private computeBar(bar: OverlayBarConfig, rect: Rect, instance: OverlayBarInstance, canvas: DOMRect) {
        const size = {
            width: instance.width,
            height: instance.height,
        }

        let x = rect.left
        let y = rect.top - size.height

        if (bar.position === 'bottom') y = rect.bottom

        if (bar.align === 'center') x = rect.left + rect.width / 2 - size.width / 2

        if (bar.align === 'end') x = rect.right - size.width

        x = Math.max(0, Math.min(x, canvas.width - size.width))
        y = Math.max(0, Math.min(y, canvas.height - size.height))

        return { x, y }
    }
}
