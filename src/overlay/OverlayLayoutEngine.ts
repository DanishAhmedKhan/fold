import { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'
import type { OverlayBarConfig, OverlayConfig, Position } from './OverlatConfig'
import type { OverlayLayout, Rect } from './OverlayTypes'

type Box = {
    x: number
    y: number
    width: number
    height: number
}

export class OverlayLayoutEngine {
    constructor(
        private editor: Editor,
        private iframeRenderer: IframeRenderer,
        private config: OverlayConfig,
        private overlayRoot: HTMLElement,
        private barElements: Map<string, HTMLElement>,
    ) {}

    public compute(): OverlayLayout {
        const layout: OverlayLayout = { bars: [] }

        const hoveredId = this.editor.state.hoveredId

        if (hoveredId) {
            const dom = this.iframeRenderer.getDom(hoveredId)
            if (dom) layout.hoverRect = this.getAbsoluteRect(dom)
        }

        const selectedIds = this.editor.state.selectedIds

        if (!selectedIds || selectedIds.size === 0) return layout

        const id = [...selectedIds][0]

        const dom = this.iframeRenderer.getDom(id)
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
        const { align, offset, gap = 0 } = bar

        const prevDisplay = el.style.display

        if (prevDisplay === 'none') {
            el.style.visibility = 'hidden'
            el.style.display = 'flex'
        }

        const size = el.getBoundingClientRect()

        el.style.display = prevDisplay
        el.style.visibility = ''

        const horizontal = position === 'top' || position === 'bottom'

        let x = 0
        let y = 0

        if (horizontal) {
            if (align === 'start') x = rect.left
            else if (align === 'center') x = rect.left + rect.width / 2 - size.width / 2
            else if (align === 'end') x = rect.right - size.width
        } else {
            if (align === 'start') y = rect.top
            else if (align === 'center') y = rect.top + rect.height / 2 - size.height / 2
            else if (align === 'end') y = rect.bottom - size.height
        }

        if (position === 'top') {
            if (offset === 'inside') y = rect.top + gap
            else if (offset === 'outside') y = rect.top - size.height - gap
            else y = rect.top - size.height / 2 - gap
        }

        if (position === 'bottom') {
            if (offset === 'inside') y = rect.bottom - size.height - gap
            else if (offset === 'outside') y = rect.bottom + gap
            else y = rect.bottom - size.height / 2 + gap
        }

        if (position === 'left') {
            if (offset === 'inside') x = rect.left + gap
            else if (offset === 'outside') x = rect.left - size.width - gap
            else x = rect.left - size.width / 2 - gap
        }

        if (position === 'right') {
            if (offset === 'inside') x = rect.right - size.width - gap
            else if (offset === 'outside') x = rect.right + gap
            else x = rect.right - size.width / 2 + gap
        }

        return {
            x,
            y,
            width: size.width,
            height: size.height,
        }
    }

    private flip(pos: Position): Position {
        if (pos === 'top') return 'bottom'
        if (pos === 'bottom') return 'top'
        if (pos === 'left') return 'right'
        return 'left'
    }

    private isOverflow(result: Box, canvas: DOMRect) {
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

        const iframeRect = this.iframeRenderer.iframe.getBoundingClientRect()
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
