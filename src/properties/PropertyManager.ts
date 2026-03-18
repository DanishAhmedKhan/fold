import type { Editor } from '../core/Editor'
import type { ElementProperty } from '../elements/EditorElement'

export class PropertyManager {
    constructor(private editor: Editor) {}

    set(nodeId: string, property: ElementProperty, value: string) {
        if (property.target === 'props') {
            this.editor.updateProp(nodeId, property.key, value)
        }

        if (property.target === 'styles') {
            this.editor.updateStyle(nodeId, property.key, value)
        }
    }

    get(nodeId: string, property: ElementProperty) {
        const node = this.editor.getNode(nodeId)

        if (!node) return ''

        if (property.target === 'props') {
            return node.props[property.key]
        }

        if (property.target === 'styles') {
            return node.styles[property.key]
        }

        return ''
    }
}
