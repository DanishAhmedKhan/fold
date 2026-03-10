import type { Editor } from '../core/Editor'

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
    position: 'top' | 'bottom' | 'left' | 'right'
    align: 'start' | 'center' | 'end'
    offset: 'inside' | 'outside'
    gap: number

    actions: OverlayAction[]
}

export interface OverlayAction {
    id: string
    icon: string | HTMLElement
    tooltip?: string
    onClick: (editor: Editor, nodeId: string) => void
}

export interface OverlayConfig {
    defaultHoverColor: string
    defaultSelectionColor: string

    elements?: Record<string, ElementOverlayConfig>

    actionBar: ActionBarConfig

    showElementName?: boolean
    showAddButton?: boolean
}
