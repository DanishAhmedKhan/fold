import type { EditorElement } from './EditorElement'
import type { EditorNode } from '../core/types'

export const InternalPlaceholderElement: EditorElement = {
    type: '__placeholder__',
    name: 'Placeholder',

    create() {
        return {
            props: {},
            styles: {},
            children: [],
        }
    },

    render(doc) {
        const el = doc.createElement('div')

        Object.assign(el.style, {
            minHeight: '40px',
            background: 'rgba(0,122,255,0.15)',
            border: '2px solid #007aff',
            boxSizing: 'border-box',
        })

        return el
    },
}

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
                    fontSize: '40px',
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

export const RowElement: EditorElement = {
    type: 'row',
    name: 'Row',

    create() {
        return {
            styles: {
                desktop: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '30px',
                },
            },
            children: ['column', 'column'],
        }
    },

    render(doc) {
        return doc.createElement('div')
    },
}

export const ColumnElement: EditorElement = {
    type: 'column',
    name: 'Column',

    create() {
        return {
            props: {},
            styles: {
                desktop: {
                    minHeight: '50px',
                },
            },
        }
    },

    render(doc) {
        return doc.createElement('div')
    },

    placeholder: true,
}

export const SectionElement: EditorElement = {
    type: '2-col-section',
    name: '2 Column Section',

    create() {
        return {
            styles: {
                desktop: {
                    padding: '100px',
                    background: 'aliceblue',
                },
            },
            children: ['row'],
        }
    },

    render(doc) {
        return doc.createElement('div')
    },
}

export const BuiltInElements = [
    InternalPlaceholderElement,
    // RootElement,
    TextElement,
    ButtonElement,
    BoxElement,
    RowElement,
    ColumnElement,
    SectionElement,
]
