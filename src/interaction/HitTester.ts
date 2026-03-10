import { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'

export class HitTester {
    private editor: Editor
    private renderer: IframeRenderer

    constructor(editor: Editor, renderer: IframeRenderer) {
        this.editor = editor
        this.renderer = renderer
    }

    public hitTest(x: number, y: number): string | null {
        let bestId: string | null = null
        let bestArea = Infinity

        for (const [id, dom] of this.renderer.nodeDomMap) {
            const rect = dom.getBoundingClientRect()

            const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom

            if (!inside) continue

            const area = rect.width * rect.height

            if (area < bestArea) {
                bestArea = area
                bestId = id
            }
        }

        return bestId
    }
}
