import React from 'react'
import type { Editor } from '../core/Editor'
import type { ElementProperty } from '../elements/types'

export function PropertyRenderer({
    editor,
    nodeId,
    property,
}: {
    editor: Editor
    nodeId: string
    property: ElementProperty
}) {
    const Control = editor.controls.get(property.type)

    if (!Control) {
        return <div>Unknown control: {property.type}</div>
    }

    return <Control editor={editor} nodeId={nodeId} property={property} />
}
