import type { EditorState } from './types'
import type { EditorPatch } from './EditorPatch'

export class EditorStore {
    state: EditorState

    listeners = new Set<(patch: EditorPatch) => void>()

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

    subscribe(fn: (patch: EditorPatch) => void) {
        this.listeners.add(fn)
        return () => this.listeners.delete(fn)
    }

    emit(patch: EditorPatch) {
        this.listeners.forEach((l) => l(patch))
    }
}
