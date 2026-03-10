import React, { useMemo } from 'react'
import { BoxElement, ButtonElement, TextElement } from '../elements/defaultElements'
import { Editor } from '../core/Editor'
import { ElementLibrary } from '../react/ElementLibrary'
import { Canvas } from '../react/Canvas'
import { Responsive } from '../react/Responsive'

export interface EditorProps {
    schema?: unknown
}

export const PageBuilder: React.FC<EditorProps> = () => {
    const editor = useMemo(() => {
        const e = new Editor()

        e.registerElement(TextElement)
        e.registerElement(ButtonElement)
        e.registerElement(BoxElement)

        return e
    }, [])

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #ddd',
                background: '#fafafa',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            <div
                style={{
                    height: 70,
                    borderBottom: '1px solid black',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                }}
            >
                <Responsive editor={editor} />
            </div>

            <div style={{ display: 'flex', flex: 1 }}>
                <div
                    style={{
                        flex: '0 0 300px',
                        borderRight: '1px solid black',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <ElementLibrary editor={editor} />
                </div>

                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Canvas editor={editor} />
                </div>
            </div>
        </div>
    )
}
