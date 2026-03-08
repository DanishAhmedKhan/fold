export type OverlayPlacement =
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'

export type OverlayOrientation = 'horizontal' | 'vertical'

export interface ElementOverlayConfig {
    hoverColor?: string
    selectionColor?: string
}

export interface ActionBarConfig {
    orientation: OverlayOrientation
    placement: OverlayPlacement
    inside?: boolean
}

export interface OverlayConfig {
    defaultHoverColor: string
    defaultSelectionColor: string

    elements?: Record<string, ElementOverlayConfig>

    actionBar: ActionBarConfig

    showElementName?: boolean
    showAddButton?: boolean
}
