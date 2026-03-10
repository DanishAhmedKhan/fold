// import { Editor } from '../core/Editor'
// import { IframeRenderer } from '../renderer/IframeRenderer'
// import { defaultOverlayConfig } from './defaultOverlayConfig'
// import type { OverlayConfig } from './OverlatConfig'

// type Rect = {
//     left: number
//     top: number
//     width: number
//     height: number
//     right: number
//     bottom: number
// }

// type Position = 'top' | 'bottom' | 'left' | 'right'

// export class OverlayManager {
//     public editor: Editor
//     public renderer: IframeRenderer
//     public config: OverlayConfig

//     public overlayRoot!: HTMLElement

//     public hoverBox!: HTMLElement
//     public selectionBox!: HTMLElement

//     public actionBar!: HTMLElement
//     public elementLabel!: HTMLElement
//     public addButton!: HTMLElement

//     private unsubscribe?: () => void

//     private rafId: number | null = null
//     private needsUpdate = true

//     private resizeObserver!: ResizeObserver
//     private mutationObserver!: MutationObserver

//     constructor(editor: Editor, renderer: IframeRenderer, config?: Partial<OverlayConfig>) {
//         this.editor = editor
//         this.renderer = renderer
//         this.config = { ...defaultOverlayConfig, ...config }
//     }

//     public mount(container: HTMLElement) {
//         this.overlayRoot = container

//         this.overlayRoot.style.position = 'absolute'
//         this.overlayRoot.style.inset = '0'
//         this.overlayRoot.style.pointerEvents = 'none'

//         this.createHoverBox()
//         this.createSelectionBox()
//         this.createActionBar()
//         this.createElementLabel()
//         this.createAddButton()

//         this.unsubscribe = this.editor.subscribe(() => this.requestUpdate())

//         this.observeLayout()
//         this.startLoop()
//     }

//     private startLoop() {
//         const loop = () => {
//             if (this.needsUpdate) {
//                 this.update()
//                 this.needsUpdate = false
//             }

//             this.rafId = requestAnimationFrame(loop)
//         }

//         loop()
//     }

//     public requestUpdate() {
//         this.needsUpdate = true
//     }

//     private observeLayout() {
//         const doc = this.renderer.doc

//         doc.addEventListener('scroll', () => this.requestUpdate(), true)
//         window.addEventListener('resize', () => this.requestUpdate())

//         this.resizeObserver = new ResizeObserver(() => {
//             this.requestUpdate()
//         })

//         this.resizeObserver.observe(this.renderer.body)

//         this.mutationObserver = new MutationObserver(() => {
//             this.requestUpdate()
//         })

//         this.mutationObserver.observe(this.renderer.body, {
//             attributes: true,
//             childList: true,
//             subtree: true,
//         })
//     }

//     public createHoverBox() {
//         const el = document.createElement('div')

//         el.style.position = 'absolute'
//         el.style.pointerEvents = 'none'
//         el.style.border = `1px dashed ${this.config.defaultHoverColor}`

//         this.overlayRoot.appendChild(el)
//         this.hoverBox = el
//     }

//     public createSelectionBox() {
//         const el = document.createElement('div')

//         el.style.position = 'absolute'
//         el.style.pointerEvents = 'none'
//         el.style.border = `2px solid ${this.config.defaultSelectionColor}`

//         this.overlayRoot.appendChild(el)
//         this.selectionBox = el
//     }

//     public createActionBar() {
//         const bar = document.createElement('div')

//         bar.style.position = 'absolute'
//         bar.style.display = 'none'
//         bar.style.gap = '4px'
//         bar.style.background = '#111'
//         bar.style.color = 'white'
//         bar.style.padding = '4px 6px'
//         bar.style.fontSize = '12px'
//         bar.style.borderRadius = '4px'
//         bar.style.pointerEvents = 'auto'
//         bar.style.transform = 'translateZ(0)'

//         this.overlayRoot.appendChild(bar)
//         this.actionBar = bar
//     }

//     public createElementLabel() {
//         const label = document.createElement('div')

//         label.style.position = 'absolute'
//         label.style.background = '#111'
//         label.style.color = 'white'
//         label.style.fontSize = '11px'
//         label.style.padding = '2px 6px'
//         label.style.borderRadius = '3px'
//         label.style.display = 'none'

//         this.overlayRoot.appendChild(label)
//         this.elementLabel = label
//     }

//     public createAddButton() {
//         const btn = document.createElement('div')

//         btn.textContent = '+'

//         btn.style.position = 'absolute'
//         btn.style.background = '#3b82f6'
//         btn.style.color = 'white'
//         btn.style.width = '18px'
//         btn.style.height = '18px'
//         btn.style.display = 'none'
//         btn.style.alignItems = 'center'
//         btn.style.justifyContent = 'center'
//         btn.style.fontSize = '12px'
//         btn.style.borderRadius = '50%'
//         btn.style.cursor = 'pointer'
//         btn.style.pointerEvents = 'auto'

//         this.overlayRoot.appendChild(btn)
//         this.addButton = btn
//     }

//     private renderActions(nodeId: string) {
//         const actions = this.config.actionBar.actions

//         this.actionBar.innerHTML = ''

//         actions.forEach((action) => {
//             const btn = document.createElement('button')

//             btn.style.background = 'transparent'
//             btn.style.border = 'none'
//             btn.style.color = 'white'
//             btn.style.cursor = 'pointer'
//             btn.style.fontSize = '12px'
//             btn.style.padding = '2px'

//             if (typeof action.icon === 'string') {
//                 btn.textContent = action.icon
//             } else {
//                 btn.appendChild(action.icon)
//             }

//             if (action.tooltip) {
//                 btn.title = action.tooltip
//             }

//             btn.onclick = (e) => {
//                 e.stopPropagation()
//                 action.onClick(this.editor, nodeId)
//             }

//             this.actionBar.appendChild(btn)
//         })
//     }

//     public update() {
//         this.updateHover()
//         this.updateSelection()
//     }

//     private updateHover() {
//         const hovered = this.editor.state.hoveredId

//         if (!hovered) {
//             this.hoverBox.style.display = 'none'
//             return
//         }

//         const dom = this.renderer.getDom(hovered)
//         if (!dom) return

//         const rect = this.getAbsoluteRect(dom)

//         const node = this.editor.getNode(hovered)
//         const elementConfig = this.config.elements?.[node?.type ?? '']

//         const color = elementConfig?.hoverColor ?? this.config.defaultHoverColor

//         this.hoverBox.style.display = 'block'
//         this.hoverBox.style.borderColor = color

//         this.positionBox(this.hoverBox, rect)
//     }

//     private updateSelection() {
//         const selectedIds = this.editor.state.selectedIds

//         if (!selectedIds || selectedIds.size === 0) {
//             this.selectionBox.style.display = 'none'
//             this.actionBar.style.display = 'none'
//             this.elementLabel.style.display = 'none'
//             this.addButton.style.display = 'none'
//             return
//         }

//         const firstSelectionId = [...selectedIds][0]

//         const dom = this.renderer.getDom(firstSelectionId)
//         if (!dom) return

//         const rect = this.getAbsoluteRect(dom)

//         const node = this.editor.getNode(firstSelectionId)
//         const elementConfig = this.config.elements?.[node?.type ?? '']

//         const color = elementConfig?.selectionColor ?? this.config.defaultSelectionColor

//         this.renderActions(firstSelectionId)

//         this.selectionBox.style.display = 'block'
//         this.selectionBox.style.borderColor = color

//         this.positionBox(this.selectionBox, rect)

//         this.positionActionBar(rect)

//         if (this.config.showElementName) {
//             this.showElementLabel(node?.type ?? '', rect)
//         }

//         if (this.config.showAddButton) {
//             this.showAddButton(rect)
//         }
//     }

//     private getAbsoluteRect(dom: HTMLElement): Rect {
//         const rect = dom.getBoundingClientRect()

//         const iframeRect = this.renderer.iframe.getBoundingClientRect()
//         const overlayRect = this.overlayRoot.getBoundingClientRect()

//         const left = iframeRect.left + rect.left - overlayRect.left
//         const top = iframeRect.top + rect.top - overlayRect.top

//         return {
//             left,
//             top,
//             width: rect.width,
//             height: rect.height,
//             right: left + rect.width,
//             bottom: top + rect.height,
//         }
//     }

//     private positionBox(el: HTMLElement, rect: Rect) {
//         el.style.left = rect.left + 'px'
//         el.style.top = rect.top + 'px'
//         el.style.width = rect.width + 'px'
//         el.style.height = rect.height + 'px'
//     }

//     private computeActionBarPosition(rect: Rect, position: Position) {
//         const { align, offset, gap = 6 } = this.config.actionBar

//         const prevDisplay = this.actionBar.style.display

//         if (prevDisplay === 'none') {
//             this.actionBar.style.visibility = 'hidden'
//             this.actionBar.style.display = 'flex'
//         }

//         const barRect = this.actionBar.getBoundingClientRect()

//         this.actionBar.style.display = prevDisplay
//         this.actionBar.style.visibility = ''

//         let x = 0
//         let y = 0

//         if (position === 'top' || position === 'bottom') {
//             if (align === 'start') x = rect.left
//             if (align === 'center') x = rect.left + rect.width / 2 - barRect.width / 2
//             if (align === 'end') x = rect.right - barRect.width

//             if (position === 'top') {
//                 y = offset === 'inside' ? rect.top + gap : rect.top - barRect.height - gap
//             }

//             if (position === 'bottom') {
//                 y = offset === 'inside' ? rect.bottom - barRect.height - gap : rect.bottom + gap
//             }
//         }

//         if (position === 'left' || position === 'right') {
//             if (align === 'start') y = rect.top
//             if (align === 'center') y = rect.top + rect.height / 2 - barRect.height / 2
//             if (align === 'end') y = rect.bottom - barRect.height

//             if (position === 'left') {
//                 x = offset === 'inside' ? rect.left + gap : rect.left - barRect.width - gap
//             }

//             if (position === 'right') {
//                 x = offset === 'inside' ? rect.right - barRect.width - gap : rect.right + gap
//             }
//         }

//         return { x, y, width: barRect.width, height: barRect.height }
//     }

//     private clamp(x: number, min: number, max: number) {
//         return Math.max(min, Math.min(max, x))
//     }

//     private positionActionBar(rect: Rect) {
//         const canvas = this.overlayRoot.getBoundingClientRect()

//         let position = this.config.actionBar.position as Position

//         let result = this.computeActionBarPosition(rect, position)

//         const overflow =
//             result.x < 0 ||
//             result.y < 0 ||
//             result.x + result.width > canvas.width ||
//             result.y + result.height > canvas.height

//         if (overflow) {
//             position = this.flipPosition(position)
//             result = this.computeActionBarPosition(rect, position)
//         }

//         result.x = this.clamp(result.x, 0, canvas.width - result.width)
//         result.y = this.clamp(result.y, 0, canvas.height - result.height)

//         this.actionBar.style.display = 'flex'
//         this.actionBar.style.left = result.x + 'px'
//         this.actionBar.style.top = result.y + 'px'
//     }

//     private flipPosition(pos: Position): Position {
//         if (pos === 'top') return 'bottom'
//         if (pos === 'bottom') return 'top'
//         if (pos === 'left') return 'right'
//         return 'left'
//     }

//     private showElementLabel(name: string, rect: Rect) {
//         this.elementLabel.style.display = 'block'
//         this.elementLabel.textContent = name

//         this.elementLabel.style.left = rect.left + 'px'
//         this.elementLabel.style.top = rect.top - 18 + 'px'
//     }

//     private showAddButton(rect: Rect) {
//         this.addButton.style.display = 'flex'

//         this.addButton.style.left = rect.left + rect.width / 2 - 9 + 'px'
//         this.addButton.style.top = rect.bottom - 8 + 'px'
//     }

//     public destroy() {
//         this.unsubscribe?.()

//         this.resizeObserver?.disconnect()
//         this.mutationObserver?.disconnect()

//         if (this.rafId) cancelAnimationFrame(this.rafId)
//     }
// }

import { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'
import { defaultOverlayConfig } from './defaultOverlayConfig'
import type { OverlayConfig } from './OverlatConfig'

import { OverlayLayoutEngine } from './OverlayLayoutEngine'
import { OverlayRenderer } from './OverlayRenderer'

export class OverlayManager {
    public overlayRoot!: HTMLElement

    public hoverBox!: HTMLElement
    public selectionBox!: HTMLElement
    public actionBar!: HTMLElement
    public elementLabel!: HTMLElement
    public addButton!: HTMLElement

    private layout!: OverlayLayoutEngine
    private rendererUI!: OverlayRenderer

    private rafId: number | null = null
    private needsUpdate = true
    private unsubscribe?: () => void

    private resizeObserver!: ResizeObserver
    private mutationObserver!: MutationObserver

    constructor(
        public editor: Editor,
        public renderer: IframeRenderer,
        public config: OverlayConfig = defaultOverlayConfig,
    ) {}

    mount(container: HTMLElement) {
        this.overlayRoot = container

        this.overlayRoot.style.position = 'absolute'
        this.overlayRoot.style.inset = '0'
        this.overlayRoot.style.pointerEvents = 'none'

        this.createElements()

        this.layout = new OverlayLayoutEngine(this.editor, this.renderer, this.config, this.overlayRoot, this.actionBar)

        this.rendererUI = new OverlayRenderer(
            this.hoverBox,
            this.selectionBox,
            this.actionBar,
            this.elementLabel,
            this.addButton,
        )

        this.unsubscribe = this.editor.subscribe(() => this.requestUpdate())

        this.observeLayout()
        this.startLoop()
    }

    private startLoop() {
        const loop = () => {
            if (this.needsUpdate) {
                const layout = this.layout.compute()
                this.rendererUI.render(layout)
                this.needsUpdate = false
            }

            this.rafId = requestAnimationFrame(loop)
        }

        loop()
    }

    requestUpdate() {
        this.needsUpdate = true
    }

    private observeLayout() {
        const doc = this.renderer.doc

        doc.addEventListener('scroll', () => this.requestUpdate(), true)

        window.addEventListener('resize', () => this.requestUpdate())

        this.resizeObserver = new ResizeObserver(() => this.requestUpdate())
        this.resizeObserver.observe(this.renderer.body)

        this.mutationObserver = new MutationObserver(() => this.requestUpdate())

        this.mutationObserver.observe(this.renderer.body, {
            attributes: true,
            childList: true,
            subtree: true,
        })
    }

    private createElements() {
        const create = () => {
            const el = document.createElement('div')
            el.style.position = 'absolute'
            el.style.pointerEvents = 'none'
            this.overlayRoot.appendChild(el)
            return el
        }

        this.hoverBox = create()
        this.selectionBox = create()

        this.hoverBox.style.border = '1px dashed #999'
        this.selectionBox.style.border = '2px solid #3b82f6'

        this.actionBar = document.createElement('div')
        this.actionBar.style.position = 'absolute'
        this.actionBar.style.display = 'none'
        this.actionBar.style.pointerEvents = 'auto'
        this.overlayRoot.appendChild(this.actionBar)

        this.elementLabel = create()
        this.addButton = create()
    }

    private renderActions(nodeId: string) {
        const actions = this.config.actionBar.actions

        this.actionBar.innerHTML = ''

        actions.forEach((action) => {
            const btn = document.createElement('button')

            btn.style.background = 'transparent'
            btn.style.border = 'none'
            btn.style.color = 'white'
            btn.style.cursor = 'pointer'
            btn.style.fontSize = '12px'
            btn.style.padding = '2px'

            if (typeof action.icon === 'string') {
                btn.textContent = action.icon
            } else {
                btn.appendChild(action.icon)
            }

            if (action.tooltip) {
                btn.title = action.tooltip
            }

            btn.onclick = (e) => {
                e.stopPropagation()
                action.onClick(this.editor, nodeId)
            }

            this.actionBar.appendChild(btn)
        })
    }

    public destroy() {
        this.unsubscribe?.()

        this.resizeObserver?.disconnect()
        this.mutationObserver?.disconnect()

        if (this.rafId) cancelAnimationFrame(this.rafId)
    }
}
