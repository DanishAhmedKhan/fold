import type { Editor } from '../core/Editor'

interface Props {
    editor: Editor
}

export function ElementLibrary({ editor }: Props) {
    const elements = editor.registry.getAll()

    return (
        <div style={{ padding: 20, borderRight: '1px solid #ddd' }}>
            <h3>Elements</h3>

            {elements.map((el) => (
                <button
                    key={el.type}
                    style={{
                        display: 'block',
                        marginBottom: 10,
                        width: '100%',
                    }}
                    onClick={() => {
                        editor.addNode(el.type, editor.state.rootId)
                    }}
                >
                    {el.name}
                </button>
            ))}
        </div>
    )
}
