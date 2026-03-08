import { useEffect, useRef } from 'react'
import type { Editor } from '../core/Editor'
import { IframeRenderer } from '../renderer/IframeRenderer'

export function Canvas({ editor }: { editor: Editor }) {
    const ref = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
        const renderer = new IframeRenderer(editor)

        renderer.mount(ref.current!)
    }, [])

    return (
        <iframe
            ref={ref}
            style={{
                flex: 1,
                height: '100vh',
                border: 'none',
            }}
        />
    )
}
