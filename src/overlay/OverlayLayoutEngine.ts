import { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'
import type { OverlayBarConfig, OverlayConfig, Position } from './OverlatConfig'
import type { OverlayLayout, Rect } from './OverlayTypes'

export class OverlayLayoutEngine {
    constructor(
        private editor: Editor,
        private renderer: IframeRenderer,
        private config: OverlayConfig,
        private overlayRoot: HTMLElement,
        private barElements: Map<string, HTMLElement>,
    ) {}

    public compute(): OverlayLayout {
        const layout: OverlayLayout = { bars: [] }

        const hovered = this.editor.state.hoveredId

        if (hovered) {
            const dom = this.renderer.getDom(hovered)
            if (dom) layout.hoverRect = this.getAbsoluteRect(dom)
        }

        const selectedIds = this.editor.state.selectedIds

        if (!selectedIds || selectedIds.size === 0) return layout

        const id = [...selectedIds][0]

        const dom = this.renderer.getDom(id)
        if (!dom) return layout

        const rect = this.getAbsoluteRect(dom)

        layout.selectionRect = rect

        for (const bar of this.config.bars) {
            const pos = this.computeBar(bar, rect)
            layout.bars.push({ id: bar.id, x: pos.x, y: pos.y })
        }

        return layout
    }

    private computeBar(bar: OverlayBarConfig, rect: Rect) {
        const el = this.barElements.get(bar.id)!
        const canvas = this.overlayRoot.getBoundingClientRect()

        let position = bar.position

        let result = this.computePosition(bar, rect, el, position)

        const overflow = this.isOverflow(result, canvas)

        if (overflow) {
            const mode = bar.flipMode ?? 'side'

            if (mode === 'offset' || mode === 'both') {
                const flippedOffset = bar.offset === 'inside' ? 'outside' : 'inside'

                const attempt = this.computePosition({ ...bar, offset: flippedOffset }, rect, el, position)

                if (!this.isOverflow(attempt, canvas)) {
                    result = attempt
                }
            }

            if ((mode === 'side' || mode === 'both') && this.isOverflow(result, canvas)) {
                position = this.flip(position)
                result = this.computePosition(bar, rect, el, position)
            }
        }

        result.x = this.clamp(result.x, 0, canvas.width - result.width)
        result.y = this.clamp(result.y, 0, canvas.height - result.height)

        return result
    }

    private computePosition(bar: OverlayBarConfig, rect: Rect, el: HTMLElement, position: Position) {
        const { align, offset, gap = 6 } = bar

        const prev = el.style.display

        if (prev === 'none') {
            el.style.visibility = 'hidden'
            el.style.display = 'flex'
        }

        const size = el.getBoundingClientRect()

        el.style.display = prev
        el.style.visibility = ''

        let x = 0
        let y = 0

        if (position === 'top' || position === 'bottom') {
            if (align === 'start') x = rect.left
            if (align === 'center') x = rect.left + rect.width / 2 - size.width / 2
            if (align === 'end') x = rect.right - size.width

            if (position === 'top') {
                y = offset === 'inside' ? rect.top + gap : rect.top - size.height - gap
            }

            if (position === 'bottom') {
                y = offset === 'inside' ? rect.bottom - size.height - gap : rect.bottom + gap
            }
        }

        if (position === 'left' || position === 'right') {
            if (align === 'start') y = rect.top
            if (align === 'center') y = rect.top + rect.height / 2 - size.height / 2
            if (align === 'end') y = rect.bottom - size.height

            if (position === 'left') {
                x = offset === 'inside' ? rect.left + gap : rect.left - size.width - gap
            }

            if (position === 'right') {
                x = offset === 'inside' ? rect.right - size.width - gap : rect.right + gap
            }
        }

        return { x, y, width: size.width, height: size.height }
    }

    private flip(pos: Position): Position {
        if (pos === 'top') return 'bottom'
        if (pos === 'bottom') return 'top'
        if (pos === 'left') return 'right'
        return 'left'
    }

    private isOverflow(result: any, canvas: DOMRect) {
        return (
            result.x < 0 ||
            result.y < 0 ||
            result.x + result.width > canvas.width ||
            result.y + result.height > canvas.height
        )
    }

    private clamp(x: number, min: number, max: number) {
        return Math.max(min, Math.min(max, x))
    }

    private getAbsoluteRect(dom: HTMLElement): Rect {
        const rect = dom.getBoundingClientRect()

        const iframeRect = this.renderer.iframe.getBoundingClientRect()
        const overlayRect = this.overlayRoot.getBoundingClientRect()

        const left = iframeRect.left + rect.left - overlayRect.left
        const top = iframeRect.top + rect.top - overlayRect.top

        return {
            left,
            top,
            width: rect.width,
            height: rect.height,
            right: left + rect.width,
            bottom: top + rect.height,
        }
    }
}
