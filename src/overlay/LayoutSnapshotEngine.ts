import type { NodeDOMRegistry } from './NodeDomRegistry'
import type { LayoutSnapshot, Rect } from './OverlayTypes'

export class LayoutSnapshotEngine {
    constructor(
        private registry: NodeDOMRegistry,
        private iframe: HTMLIFrameElement,
        private overlayRoot: HTMLElement,
    ) {}

    capture(): LayoutSnapshot {
        const nodes = new Map<string, Rect>()

        const iframeRect = this.iframe.getBoundingClientRect()
        const overlayRect = this.overlayRoot.getBoundingClientRect()

        for (const [id, el] of this.registry.entries()) {
            const r = el.getBoundingClientRect()

            const left = r.left + iframeRect.left - overlayRect.left
            const top = r.top + iframeRect.top - overlayRect.top

            nodes.set(id, {
                left,
                top,
                width: r.width,
                height: r.height,
                right: left + r.width,
                bottom: top + r.height,
            })
        }

        return { nodes }
    }
}
