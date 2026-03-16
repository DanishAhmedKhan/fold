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
    console.log(device)

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
                overflowY: 'auto',
                overflowX: 'hidden',
                background: '#f3f3f3',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'stretch',
                minHeight: 0,
            }}
        >
            <div
                id="canvas-frame"
                style={{
                    position: 'relative',
                    width: device === 'responsive' ? '100%' : width,
                    background: 'white',
                    transition: isResizing ? 'none' : 'width 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100%',
                }}
            >
                <iframe
                    ref={iframeRef}
                    style={{
                        width: '100%',
                        flex: 1,
                        border: 'none',
                        display: 'block',
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
