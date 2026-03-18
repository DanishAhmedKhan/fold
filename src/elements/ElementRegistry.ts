import type { EditorElement } from './EditorElement'

export class ElementRegistry {
    private elements = new Map<string, EditorElement>()

    register(element: EditorElement) {
        this.elements.set(element.type, element)
    }

    get(type: string) {
        return this.elements.get(type)
    }

    getAll() {
        return Array.from(this.elements.values())
    }
}
