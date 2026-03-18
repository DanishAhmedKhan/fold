import type { Editor } from '../core/Editor'
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

    render(doc: Document, node: EditorNode, ctx: RenderContext): HTMLElement

    properties?: ElementProperty[]

    handlesChildren?: boolean
}

export type RenderContext = {
    editor: Editor

    renderNode: (node: EditorNode) => HTMLElement

    appendChildren: (el: HTMLElement, node: EditorNode) => void
}
