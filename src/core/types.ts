export type StyleMap = Record<string, string>

export type ResponsiveStyles = {
    desktop?: StyleMap
    tablet?: StyleMap
    mobile?: StyleMap
}

export interface EditorNode {
    id: string
    type: string

    parent: string | null
    children: string[]

    props: Record<string, string>

    styles: ResponsiveStyles
}

export interface EditorViewport {
    device: 'desktop' | 'tablet' | 'mobile' | 'responsive'
    width: number
    isResizing: boolean
}

export interface EditorState {
    nodes: Record<string, EditorNode>

    rootId: string

    selectedIds: Set<string>
    hoveredId?: string

    viewport: EditorViewport
}
