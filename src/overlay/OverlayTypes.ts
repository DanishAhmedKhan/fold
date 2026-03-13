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
    x: number
    y: number
}

export interface OverlayLayout {
    hoverRect?: Rect | null
    selectionRect?: Rect | null
    bars: BarLayout[]
}

export type OverlayBarInstance = {
    id: string
    barId: string
    mode: 'hover' | 'selection'
    element: HTMLElement
    width: number
    height: number
}
