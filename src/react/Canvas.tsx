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
                alignItems: 'stretch',
                minHeight: 0,
            }}
        >
            <div
                id="canvas-frame"
                style={{
                    width: device === 'responsive' ? '100%' : width,
                    position: 'relative',
                    background: 'white',
                    overflow: 'hidden',
                    transition: isResizing ? 'none' : 'width 0.2s ease',
                    minHeight: '100%',
                    display: 'flex',
                    flexDirection: 'column',
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
                        overflow: 'visible',
                    }}
                />
            </div>
        </div>
    )
}
