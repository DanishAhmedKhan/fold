import type { EditorNode } from '../core/types'

export interface EditorElement {
    type: string

    name: string

    icon?: string

    create(): Partial<EditorNode>

    render(doc: Document, node: EditorNode): HTMLElement
}
