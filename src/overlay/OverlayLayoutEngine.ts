// import type { OverlayLayout, LayoutSnapshot, Rect } from './OverlayTypes'
// import type { OverlayConfig, OverlayBarConfig } from './OverlatConfig'

// export class OverlayLayoutEngine {
//     constructor(private config: OverlayConfig, private overlayRoot: HTMLElement) {}

//     public compute(snapshot: LayoutSnapshot, hoveredId?: string, selectedId?: string): OverlayLayout {
//         const layout: OverlayLayout = { bars: [] }

//         const hoverRect = hoveredId ? snapshot.nodes.get(hoveredId) : undefined
//         const selectionRect = selectedId ? snapshot.nodes.get(selectedId) : undefined

//         layout.hoverRect = hoverRect
//         layout.selectionRect = selectionRect

//         const canvas = this.overlayRoot.getBoundingClientRect()

//         const modes = [
//             { mode: 'hover' as const, rect: hoverRect },
//             { mode: 'selection' as const, rect: selectionRect },
//         ]

//         for (const { mode, rect } of modes) {
//             if (!rect) continue

//             for (const bar of this.config.bars) {
//                 const visible = bar.visibility?.[mode] ?? true
//                 if (!visible) continue

//                 let pos = this.computeBar(bar, rect, size)

//                 if (this.isOverflow(pos, size, canvas)) {
//                     const flipMode = bar.flipMode ?? 'offset'

//                     if (flipMode === 'side' || flipMode === 'both') {
//                         const flippedBar = {
//                             ...bar,
//                             position: this.flipSide(bar.position),
//                         }

//                         const alt = this.computeBar(flippedBar, rect, size)

//                         if (!this.isOverflow(alt, size, canvas)) {
//                             pos = alt
//                         }
//                     }

//                     if (this.isOverflow(pos, size, canvas) && (flipMode === 'offset' || flipMode === 'both')) {
//                         const flippedBar = {
//                             ...bar,
//                             offset: this.flipOffset(bar.offset),
//                         }

//                         const alt = this.computeBar(flippedBar, rect, size)

//                         if (!this.isOverflow(alt, size, canvas)) {
//                             pos = alt
//                         }
//                     }
//                 }

//                 layout.bars.push({
//                     id: bar.id,
//                     mode,
//                     x: pos.x,
//                     y: pos.y,
//                 })
//             }
//         }

//         return layout
//     }

//     private computeBar(bar: OverlayBarConfig, rect: Rect, size: { width: number; height: number }) {
//         const offset = bar.offset ?? 'outside'

//         let x = rect.left
//         let y = rect.top

//         if (bar.position === 'top') {
//             if (offset === 'outside') y = rect.top - size.height
//             if (offset === 'inside') y = rect.top
//             if (offset === 'middle') y = rect.top - size.height / 2
//         }

//         if (bar.position === 'bottom') {
//             if (offset === 'outside') y = rect.bottom
//             if (offset === 'inside') y = rect.bottom - size.height
//             if (offset === 'middle') y = rect.bottom - size.height / 2
//         }

//         if (bar.position === 'left') {
//             if (offset === 'outside') x = rect.left - size.width
//             if (offset === 'inside') x = rect.left
//             if (offset === 'middle') x = rect.left - size.width / 2
//         }

//         if (bar.position === 'right') {
//             if (offset === 'outside') x = rect.right
//             if (offset === 'inside') x = rect.right - size.width
//             if (offset === 'middle') x = rect.right - size.width / 2
//         }

//         if (bar.position === 'top' || bar.position === 'bottom') {
//             if (bar.align === 'start') x = rect.left

//             if (bar.align === 'center') x = rect.left + rect.width / 2 - size.width / 2

//             if (bar.align === 'end') x = rect.right - size.width
//         }

//         if (bar.position === 'left' || bar.position === 'right') {
//             if (bar.align === 'start') y = rect.top

//             if (bar.align === 'center') y = rect.top + rect.height / 2 - size.height / 2

//             if (bar.align === 'end') y = rect.bottom - size.height
//         }

//         return { x, y }
//     }

//     private isOverflow(pos: { x: number; y: number }, size: { width: number; height: number }, canvas: DOMRect) {
//         return pos.x < 0 || pos.y < 0 || pos.x + size.width > canvas.width || pos.y + size.height > canvas.height
//     }

//     private flipSide(position: OverlayBarConfig['position']): OverlayBarConfig['position'] {
//         if (position === 'top') return 'bottom'
//         if (position === 'bottom') return 'top'
//         if (position === 'left') return 'right'
//         if (position === 'right') return 'left'

//         return position
//     }

//     private flipOffset(offset: OverlayBarConfig['offset']): OverlayBarConfig['offset'] {
//         if (offset === 'outside') return 'inside'
//         if (offset === 'inside') return 'outside'

//         return 'middle'
//     }
// }

import type { OverlayLayout, LayoutSnapshot, Rect } from './OverlayTypes'
import type { OverlayConfig, OverlayBarConfig } from './OverlatConfig'

export class OverlayLayoutEngine {
    constructor(private config: OverlayConfig, private overlayRoot: HTMLElement) {}

    public compute(
        snapshot: LayoutSnapshot,
        hoveredId?: string,
        selectedId?: string,
        sizes?: Map<string, { width: number; height: number }>,
    ): OverlayLayout {
        const layout: OverlayLayout = { bars: [] }

        const hoverRect = hoveredId ? snapshot.nodes.get(hoveredId) : undefined
        const selectionRect = selectedId ? snapshot.nodes.get(selectedId) : undefined

        layout.hoverRect = hoverRect
        layout.selectionRect = selectionRect

        const canvas = this.overlayRoot.getBoundingClientRect()

        const modes = [
            { mode: 'hover' as const, rect: hoverRect },
            { mode: 'selection' as const, rect: selectionRect },
        ]

        for (const { mode, rect } of modes) {
            if (!rect) continue

            for (const bar of this.config.bars) {
                const visible = bar.visibility?.[mode] ?? true
                if (!visible) continue

                const key = `${bar.id}-${mode}`

                const size = sizes?.get(key) ?? {
                    width: 80,
                    height: 24,
                }

                let pos = this.computeBar(bar, rect, size)

                if (this.isOverflow(pos, size, canvas)) {
                    const flipMode = bar.flipMode ?? 'offset'

                    if (flipMode === 'side' || flipMode === 'both') {
                        const flippedBar = {
                            ...bar,
                            position: this.flipSide(bar.position),
                        }

                        const alt = this.computeBar(flippedBar, rect, size)

                        if (!this.isOverflow(alt, size, canvas)) {
                            pos = alt
                        }
                    }

                    if (this.isOverflow(pos, size, canvas) && (flipMode === 'offset' || flipMode === 'both')) {
                        const flippedBar = {
                            ...bar,
                            offset: this.flipOffset(bar.offset),
                        }

                        const alt = this.computeBar(flippedBar, rect, size)

                        if (!this.isOverflow(alt, size, canvas)) {
                            pos = alt
                        }
                    }
                }

                layout.bars.push({
                    id: bar.id,
                    mode,
                    x: pos.x,
                    y: pos.y,
                })
            }
        }

        return layout
    }

    private computeBar(bar: OverlayBarConfig, rect: Rect, size: { width: number; height: number }) {
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

    private isOverflow(pos: { x: number; y: number }, size: { width: number; height: number }, canvas: DOMRect) {
        return pos.x < 0 || pos.y < 0 || pos.x + size.width > canvas.width || pos.y + size.height > canvas.height
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
