import type { EditorNode } from '../../core/types'
import type { OverlayConfig } from '../OverlatConfig'
import type { OverlayLayout, OverlayMode } from '../OverlayTypes'
import { OverlayBar } from './OverlayBar'
import { OverlayBox } from './OverlayBox'

export class OverlayLayer {
    public box!: OverlayBox
    public bars!: OverlayBar[]

    constructor(private overlayRoot: HTMLElement, private config: OverlayConfig, private mode: OverlayMode) {
        this.createBox()
        this.createBars()
    }

    private createBox() {
        this.box = new OverlayBox(this.overlayRoot, this.mode, {
            borderStyle: this.config[this.mode].borderStyle,
            index: this.mode === 'hover' ? 9999 : 999,
        })
    }

    private createBars() {
        this.bars = []
        for (const barConfig of this.config.bars) {
            const visible = barConfig.visibility?.[this.mode] ?? true
            if (!visible) continue

            this.bars.push(new OverlayBar(this.overlayRoot, this.mode, barConfig, this.config))
        }
    }

    public update(node: EditorNode | undefined, layout: OverlayLayout) {
        if (!node) {
            this.box.hide()
            this.bars.forEach((b) => b.hide())
            return
        }

        const rect = this.mode === 'hover' ? layout.hoverRect : layout.selectionRect

        if (rect) {
            this.box.update(rect)
            this.box.show()
        } else this.box.hide()

        this.bars.forEach((bar) => {
            const barLayout = layout.bars.find((b) => b.id === bar.config.id && b.mode === this.mode)

            if (!barLayout) {
                bar.hide()
                return
            }

            bar.setNode(node)
            bar.show()
            bar.updatePosition(barLayout.x, barLayout.y)
        })
    }
}
