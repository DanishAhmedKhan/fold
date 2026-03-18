import type { EditorElement } from './types'
import type { EditorNode } from '../core/types'

// export const RootElement: EditorElement = {
//     type: 'root',
//     name: 'Root',

//     create() {
//         return {}
//     },

//     render(doc, node, ctx) {
//         const el = doc.createElement('div')

//         el.style.minHeight = '100vh'

//         ctx.appendChildren(el, node)

//         return el
//     },
// }

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
                    display: 'flex',
                    gap: '10px',
                },
            },
            children: ['column', 'column'],
        }
    },

    render(doc, node, ctx) {
        const el = doc.createElement('div')

        ctx.appendChildren(el, node)

        return el
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
                    flex: '1',
                    minHeight: '50px',
                },
            },
        }
    },

    render(doc) {
        const el = doc.createElement('div')

        return el
    },
}

export const SectionElement: EditorElement = {
    type: '2-col-section',
    name: '2 Column Section',

    create() {
        return {
            styles: {
                desktop: {
                    display: 'grid',
                    padding: '100px',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    border: '1px solid red',
                },
            },
            children: ['row'],
        }
    },

    render(doc) {
        const el = doc.createElement('div')
        return el
    },
}

export const BuiltInElements = [
    // RootElement,
    TextElement,
    ButtonElement,
    BoxElement,
    RowElement,
    ColumnElement,
    SectionElement,
]
