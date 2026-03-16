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
                desktop: {
                    padding: '10px',
                    fontSize: '20px',
                },

                mobile: {
                    fontSize: '10px',
                },
            },
        }
    },

    render(doc: Document, node: EditorNode) {
        const el = doc.createElement('div')

        el.innerText = node.props.text

        return el
    },
}

export const ButtonElement: EditorElement = {
    type: 'button',

    name: 'Button',

    create() {
        return {
            props: {
                label: 'Button',
            },
            styles: {
                desktop: {
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '10px',
                    color: 'white',
                    background: 'black',
                },
            },
        }
    },

    render(doc: Document, node: EditorNode) {
        const el = doc.createElement('div')

        el.innerText = node.props.label

        return el
    },
}

export const BoxElement: EditorElement = {
    type: 'box',

    name: 'Box',

    create() {
        return {
            styles: {
                desktop: {
                    padding: '100px',
                    border: '1px solid #eee',
                },
            },
        }
    },

    render(doc: Document) {
        const el = doc.createElement('div')

        return el
    },
}

export const BuiltInElements = [TextElement, ButtonElement, BoxElement]
