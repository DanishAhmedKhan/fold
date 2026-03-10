export type Rect = {
    left: number
    top: number
    width: number
    height: number
    right: number
    bottom: number
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
