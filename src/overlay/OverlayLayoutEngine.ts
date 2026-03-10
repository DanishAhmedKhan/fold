import { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'
import type { OverlayConfig } from './OverlatConfig'
import type { OverlayLayout, Position, Rect } from './OverlayTypes'

export class OverlayLayoutEngine {
    constructor(
        private editor: Editor,
        private renderer: IframeRenderer,
        private config: OverlayConfig,
        private overlayRoot: HTMLElement,
        private actionBar: HTMLElement,
    ) {}

    public compute(): OverlayLayout {
        const layout: OverlayLayout = {}

        const hovered = this.editor.state.hoveredId

        if (hovered) {
            const dom = this.renderer.getDom(hovered)
            if (dom) layout.hoverRect = this.getAbsoluteRect(dom)
        }

        const selectedIds = this.editor.state.selectedIds

        if (selectedIds && selectedIds.size > 0) {
            const id = [...selectedIds][0]

            const dom = this.renderer.getDom(id)
            if (!dom) return layout

            const rect = this.getAbsoluteRect(dom)

            layout.selectionRect = rect

            layout.actionBar = this.computeActionBar(rect)

            if (this.config.showElementName) {
                const node = this.editor.getNode(id)
                layout.label = { text: node?.type ?? '', rect }
            }

            if (this.config.showAddButton) {
                layout.addButton = rect
            }
        }

        return layout
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

    private computeActionBar(rect: Rect) {
        const canvas = this.overlayRoot.getBoundingClientRect()

        let position = this.config.actionBar.position as Position

        let result = this.computePosition(rect, position)

        const overflow =
            result.x < 0 ||
            result.y < 0 ||
            result.x + result.width > canvas.width ||
            result.y + result.height > canvas.height

        if (overflow) {
            position = this.flip(position)
            result = this.computePosition(rect, position)
        }

        result.x = this.clamp(result.x, 0, canvas.width - result.width)
        result.y = this.clamp(result.y, 0, canvas.height - result.height)

        return { x: result.x, y: result.y }
    }

    private computePosition(rect: Rect, position: Position) {
        const { align, offset, gap = 6 } = this.config.actionBar

        const prevDisplay = this.actionBar.style.display

        if (prevDisplay === 'none') {
            this.actionBar.style.visibility = 'hidden'
            this.actionBar.style.display = 'flex'
        }

        const barRect = this.actionBar.getBoundingClientRect()

        this.actionBar.style.display = prevDisplay
        this.actionBar.style.visibility = ''

        let x = 0
        let y = 0

        if (position === 'top' || position === 'bottom') {
            if (align === 'start') x = rect.left
            if (align === 'center') x = rect.left + rect.width / 2 - barRect.width / 2
            if (align === 'end') x = rect.right - barRect.width

            if (position === 'top') {
                y = offset === 'inside' ? rect.top + gap : rect.top - barRect.height - gap
            }

            if (position === 'bottom') {
                y = offset === 'inside' ? rect.bottom - barRect.height - gap : rect.bottom + gap
            }
        }

        if (position === 'left' || position === 'right') {
            if (align === 'start') y = rect.top
            if (align === 'center') y = rect.top + rect.height / 2 - barRect.height / 2
            if (align === 'end') y = rect.bottom - barRect.height

            if (position === 'left') {
                x = offset === 'inside' ? rect.left + gap : rect.left - barRect.width - gap
            }

            if (position === 'right') {
                x = offset === 'inside' ? rect.right - barRect.width - gap : rect.right + gap
            }
        }

        return { x, y, width: barRect.width, height: barRect.height }
    }

    private flip(pos: Position): Position {
        if (pos === 'top') return 'bottom'
        if (pos === 'bottom') return 'top'
        if (pos === 'left') return 'right'

        return 'left'
    }

    private clamp(x: number, min: number, max: number) {
        return Math.max(min, Math.min(max, x))
    }
}
