import React, { useEffect, useState } from 'react'
import type { Editor } from '../core/Editor'
import { PropertyRenderer } from './PropertyRenderer'

export interface PropertyEditorProps {
    editor: Editor
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({ editor }) => {
    const [, force] = useState(0)

    useEffect(() => {
        return editor.subscribe(() => {
            force((v) => v + 1)
        })
    }, [editor])

    const selectedId = [...editor.state.selectedIds][0]

    if (!selectedId) {
        return <div style={{ padding: 12 }}>No element selected</div>
    }

    const node = editor.getNode(selectedId)

    if (!node) return null

    const element = editor.elementRegistry.get(node.type)

    if (!element?.properties) {
        return <div style={{ padding: 12 }}>No properties</div>
    }

    return (
        <div style={{ padding: 12 }}>
            {element.properties.map((property) => (
                <PropertyRenderer key={property.key} editor={editor} nodeId={node.id} property={property} />
            ))}
        </div>
    )
}
