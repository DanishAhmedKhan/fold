export type Rect = {
    left: number
    top: number
    width: number
    height: number
    right: number
    bottom: number
}

export type Position = 'top' | 'bottom' | 'left' | 'right'

export interface OverlayLayout {
    hoverRect?: Rect | null
    selectionRect?: Rect | null
    actionBar?: { x: number; y: number } | null
    label?: { text: string; rect: Rect } | null
    addButton?: Rect | null
}
