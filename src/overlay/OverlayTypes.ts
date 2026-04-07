export type OverlayMode = 'hover' | 'selection'

export type Rect = {
    left: number
    top: number
    width: number
    height: number
    right: number
    bottom: number
}

export type LayoutSnapshot = {
    nodes: Map<string, Rect>
}

export interface BarLayout {
    id: string
    mode: OverlayMode
    x: number
    y: number
}

export interface OverlayLayout {
    hoverRect?: Rect | null
    selectionRect?: Rect | null
    bars: BarLayout[]
    // placeholders: { nodeId: string; rect: Rect }[]
}

export type OverlayBarInstance = {
    id: string
    barId: string
    mode: 'hover' | 'selection'
    element: HTMLElement
    width: number
    height: number
}
