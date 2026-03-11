import { useEffect, useRef } from 'react'
import type { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'
import { OverlayManager } from '../overlay/OverlayManager'
import { useEditorState } from '../core/useEditorState'
import { ResizeHandle } from './ResizeHandle'

export function Canvas({ editor }: { editor: Editor }) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)

    const state = useEditorState(editor)
    const width = state.viewport.width
    const device = state.viewport.device
    const isResizing = state.viewport.isResizing

    useEffect(() => {
        const renderer = new IframeRenderer(editor)
        renderer.mount(iframeRef.current!)

        const overlay = new OverlayManager(editor, renderer)
        overlay.mount(overlayRef.current!)
    }, [editor])

    return (
        <div
            style={{
                flex: 1,
                overflow: 'auto',
                background: '#f3f3f3',
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <div
                id="canvas-frame"
                style={{
                    width: device === 'responsive' ? '100%' : width,
                    position: 'relative',
                    border: '1px solid red',
                    background: 'white',
                    transition: isResizing ? 'none' : 'width 0.2s ease',
                }}
            >
                <iframe
                    ref={iframeRef}
                    style={{
                        width: '100%',
                        height: '100vh',
                        border: 'none',
                    }}
                />

                {device !== 'responsive' && <ResizeHandle editor={editor} />}

                <div
                    ref={overlayRef}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                    }}
                />
            </div>
        </div>
    )
}
