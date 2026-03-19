import type { Editor } from '../core/Editor'

export type OverlayOrientation = 'horizontal' | 'vertical'
export type Position = 'top' | 'bottom' | 'left' | 'right'
export type Align = 'start' | 'center' | 'end'
export type Offset = 'inside' | 'outside' | 'middle'

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
    align: Align
    offset: Offset

    orientation?: OverlayOrientation
    gap?: number

    flipMode?: 'side' | 'offset' | 'both'

    actions?: OverlayAction[]

    style?: Record<string, string | number>

    visibility?: {
        hover?: boolean
        selection?: boolean
    }
}

export interface OverlayBoxConfig {
    borderStyle: OverlayBorderStyle
    index: number
}

export interface OverlayBorderStyle {
    color?: string
    width?: number
    style?: 'solid' | 'dashed' | 'dotted'
    radius?: number
}

export interface OverlayConfig {
    hover: OverlayBoxConfig
    selection: OverlayBoxConfig

    bars: OverlayBarConfig[]
}
