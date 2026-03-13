import { dragState } from '../core/DragState'
import type { Editor } from '../core/Editor'

interface Props {
    editor: Editor
}

export function ElementLibrary({ editor }: Props) {
    const elements = editor.elementRegistry.getAll()

    return (
        <div
            style={{
                padding: 20,
                borderRight: '1px solid #ddd',
            }}
        >
            <h3>Elements</h3>

            {elements.map((el) => (
                <div
                    key={el.type}
                    draggable
                    style={{
                        padding: '8px 10px',
                        border: '1px solid #ddd',
                        marginBottom: 10,
                        cursor: 'grab',
                        background: '#fff',
                    }}
                    onDragStart={() => {
                        dragState.type = el.type
                    }}
                    onDragEnd={() => {
                        dragState.type = null
                    }}
                >
                    {el.name}
                </div>
            ))}
        </div>
    )
}
