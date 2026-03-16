import React from 'react'
import { Editor } from '../core/Editor'
import { ElementLibrary } from '../react/ElementLibrary'
import { Canvas } from '../react/Canvas'
import { Responsive } from '../react/Responsive'

export interface EditorProps {
    schema?: unknown
}

export const PageBuilder: React.FC<EditorProps> = () => {
    const editor = new Editor()

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

            <div
                style={{
                    display: 'flex',
                    flex: 1,
                    minHeight: 0,
                }}
            >
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
                        minHeight: 0,
                        display: 'flex',
                    }}
                >
                    <Canvas editor={editor} />
                </div>
            </div>
        </div>
    )
}
