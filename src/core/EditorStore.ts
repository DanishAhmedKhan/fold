import type { EditorState } from './types'

export class EditorStore {
    state: EditorState

    listeners = new Set<() => void>()

    constructor() {
        const rootId = 'root'

        this.state = {
            rootId,
            nodes: {
                root: {
                    id: rootId,
                    type: 'root',
                    parent: null,
                    children: [],
                    props: {},
                    styles: {},
                },
            },
        }
    }

    subscribe(fn: () => void) {
        this.listeners.add(fn)
        return () => this.listeners.delete(fn)
    }

    emit() {
        this.listeners.forEach((l) => l())
    }
}
