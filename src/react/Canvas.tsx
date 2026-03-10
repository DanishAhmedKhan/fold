import { useEffect, useRef } from 'react'
import type { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'
import { OverlayManager } from '../overlay/OverlayManager'

export function Canvas({ editor }: { editor: Editor }) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)

    const width = editor.state.viewport.width

    useEffect(() => {
        const renderer = new IframeRenderer(editor)
        renderer.mount(iframeRef.current!)

        const overlay = new OverlayManager(editor, renderer)
        overlay.mount(overlayRef.current!)
    }, [editor])

    return (
        <div
            style={{
                width,
                position: 'relative',
                flex: 1,
                overflow: 'hidden',
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

            <div
                ref={overlayRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                }}
            />
        </div>
    )
}
