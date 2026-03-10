import type { Editor } from '../core/Editor'

export type OverlayOrientation = 'horizontal' | 'vertical'
export type Position = 'top' | 'bottom' | 'left' | 'right'

export interface OverlayAction {
    id: string
    icon?: string | HTMLElement
    label?: string
    tooltip?: string
    onClick?: (editor: Editor, nodeId: string) => void
}

export interface OverlayBarConfig {
    id: string

    position: Position
    align: 'start' | 'center' | 'end'
    offset: 'inside' | 'outside'

    orientation?: OverlayOrientation
    gap?: number

    flipMode?: 'side' | 'offset' | 'both'

    actions?: OverlayAction[]

    renderLabel?: boolean
    renderAddButton?: boolean
}

export interface OverlayConfig {
    defaultHoverColor: string
    defaultSelectionColor: string

    bars: OverlayBarConfig[]
}
