import type { OverlayLayout, OverlayBarInstance, LayoutSnapshot, Rect } from './OverlayTypes'

import type { OverlayConfig, OverlayBarConfig } from './OverlatConfig'

export class OverlayLayoutEngine {
    constructor(
        private config: OverlayConfig,
        private overlayRoot: HTMLElement,
        private barInstances: Map<string, OverlayBarInstance>,
    ) {}

    public compute(snapshot: LayoutSnapshot, hoveredId?: string, selectedId?: string): OverlayLayout {
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

            let pos = this.computeBar(bar, rect, instance)

            if (this.isOverflow(pos, instance, canvas)) {
                const flipMode = bar.flipMode ?? 'offset'

                if (flipMode === 'side' || flipMode === 'both') {
                    const flippedBar = {
                        ...bar,
                        position: this.flipSide(bar.position),
                    }

                    const alt = this.computeBar(flippedBar, rect, instance)

                    if (!this.isOverflow(alt, instance, canvas)) {
                        pos = alt
                    }
                }

                if (this.isOverflow(pos, instance, canvas) && (flipMode === 'offset' || flipMode === 'both')) {
                    const flippedBar = {
                        ...bar,
                        offset: this.flipOffset(bar.offset),
                    }

                    const alt = this.computeBar(flippedBar, rect, instance)

                    if (!this.isOverflow(alt, instance, canvas)) {
                        pos = alt
                    }
                }
            }

            layout.bars.push({
                id: instance.id,
                x: pos.x,
                y: pos.y,
            })
        }

        return layout
    }

    private computeBar(bar: OverlayBarConfig, rect: Rect, instance: OverlayBarInstance) {
        const size = {
            width: instance.width,
            height: instance.height,
        }

        const offset = bar.offset ?? 'outside'

        let x = rect.left
        let y = rect.top

        if (bar.position === 'top') {
            if (offset === 'outside') y = rect.top - size.height
            if (offset === 'inside') y = rect.top
            if (offset === 'middle') y = rect.top - size.height / 2
        }

        if (bar.position === 'bottom') {
            if (offset === 'outside') y = rect.bottom
            if (offset === 'inside') y = rect.bottom - size.height
            if (offset === 'middle') y = rect.bottom - size.height / 2
        }

        if (bar.position === 'left') {
            if (offset === 'outside') x = rect.left - size.width
            if (offset === 'inside') x = rect.left
            if (offset === 'middle') x = rect.left - size.width / 2
        }

        if (bar.position === 'right') {
            if (offset === 'outside') x = rect.right
            if (offset === 'inside') x = rect.right - size.width
            if (offset === 'middle') x = rect.right - size.width / 2
        }

        if (bar.position === 'top' || bar.position === 'bottom') {
            if (bar.align === 'start') x = rect.left

            if (bar.align === 'center') x = rect.left + rect.width / 2 - size.width / 2

            if (bar.align === 'end') x = rect.right - size.width
        }

        if (bar.position === 'left' || bar.position === 'right') {
            if (bar.align === 'start') y = rect.top

            if (bar.align === 'center') y = rect.top + rect.height / 2 - size.height / 2

            if (bar.align === 'end') y = rect.bottom - size.height
        }

        return { x, y }
    }

    private isOverflow(pos: { x: number; y: number }, instance: OverlayBarInstance, canvas: DOMRect) {
        return (
            pos.x < 0 || pos.y < 0 || pos.x + instance.width > canvas.width || pos.y + instance.height > canvas.height
        )
    }

    private flipSide(position: OverlayBarConfig['position']): OverlayBarConfig['position'] {
        if (position === 'top') return 'bottom'
        if (position === 'bottom') return 'top'
        if (position === 'left') return 'right'
        if (position === 'right') return 'left'

        return position
    }

    private flipOffset(offset: OverlayBarConfig['offset']): OverlayBarConfig['offset'] {
        if (offset === 'outside') return 'inside'
        if (offset === 'inside') return 'outside'

        return 'middle'
    }
}
