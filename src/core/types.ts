export interface NodeStyles {
    [key: string]: string
}

export interface EditorNode {
    id: string
    type: string

    parent: string | null
    children: string[]

    props: Record<string, string>

    styles: NodeStyles
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
