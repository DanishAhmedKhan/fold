import type { EditorElement } from './types'
import type { EditorNode } from '../core/types'

export const TextElement: EditorElement = {
    type: 'text',

    name: 'Text',

    create() {
        return {
            props: {
                text: 'Edit text',
            },
            styles: {
                padding: '10px',
            },
        }
    },

    render(doc: Document, node: EditorNode) {
        const el = doc.createElement('div')

        el.innerText = node.props.text

        return el
    },
}

export const BoxElement: EditorElement = {
    type: 'box',

    name: 'Box',

    create() {
        return {
            styles: {
                padding: '40px',
                border: '1px solid #eee',
            },
        }
    },

    render(doc: Document) {
        const el = doc.createElement('div')

        return el
    },
}
