import type { EditorState } from './types'
import type { EditorPatch } from './EditorPatch'

export class EditorStore {
    public state: EditorState

    public listeners = new Set<(patch: EditorPatch) => void>()

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
            selectedIds: new Set<string>(),

            viewport: {
                device: 'desktop',
                width: 1280,
            },
        }
    }

    public subscribe(fn: (patch: EditorPatch) => void) {
        this.listeners.add(fn)
        return () => this.listeners.delete(fn)
    }

    public emit(patch: EditorPatch) {
        this.listeners.forEach((l) => l(patch))
    }
}
