import type { EditorNode } from '../core/types'

export interface ElementProperty {
    key: string
    label: string

    type: string

    target: 'props' | 'styles'

    responsive?: boolean
}

export interface EditorElement {
    type: string

    name: string

    icon?: string

    create(): Partial<EditorNode>

    render(doc: Document, node: EditorNode): HTMLElement

    properties?: ElementProperty[]
}
