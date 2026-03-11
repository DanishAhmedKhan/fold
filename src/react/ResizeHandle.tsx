import React, { useRef, useEffect, useState } from 'react'
import { useEditorState } from '../core/useEditorState'
import type { Editor } from '../core/Editor'

export function ResizeHandle({ editor }: { editor: Editor }) {
    const state = useEditorState(editor)
    const device = state.viewport.device

    const frameRef = useRef<HTMLDivElement | null>(null)
    const handleRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        frameRef.current = document.getElementById('canvas-frame') as HTMLDivElement
    }, [])

    const MIN_WIDTH = 320
    const MAX_WIDTH = 2000

    const startWidthRef = useRef(0)
    const startMouseOffsetRef = useRef(0)

    const onPointerDown = (e: React.PointerEvent) => {
        if (device === 'responsive' || !frameRef.current) return

        const handle = handleRef.current
        if (!handle) return

        const rect = frameRef.current.getBoundingClientRect()
        const rightEdge = rect.right

        startWidthRef.current = rect.width

        startMouseOffsetRef.current = e.clientX - rightEdge

        handle.setPointerCapture(e.pointerId)

        editor.setIsResizing(true)
        document.body.style.userSelect = 'none'
        document.body.style.cursor = 'ew-resize'
    }

    const onPointerMove = (e: React.PointerEvent) => {
        if (!frameRef.current || !e.currentTarget.hasPointerCapture(e.pointerId)) return

        const rect = frameRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2

        const adjustedMouseX = e.clientX - startMouseOffsetRef.current

        let newWidth = (adjustedMouseX - centerX) * 2

        if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH
        if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH

        frameRef.current.style.width = `${newWidth}px`
    }

    const onPointerUp = (e: React.PointerEvent) => {
        if (!frameRef.current) return

        const handle = handleRef.current
        if (handle && handle.hasPointerCapture(e.pointerId)) {
            handle.releasePointerCapture(e.pointerId)
        }

        document.body.style.userSelect = ''
        document.body.style.cursor = ''

        const finalWidth = frameRef.current.offsetWidth
        if (device !== 'responsive') {
            editor.setCanvasWidth(finalWidth)
        }
        editor.setIsResizing(false)
    }

    const [isHovered, setIsHovered] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    return (
        <div
            ref={handleRef}
            onPointerDown={(e) => {
                setIsDragging(true)
                onPointerDown(e)
            }}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => {
                setIsDragging(false)
                onPointerUp(e)
            }}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
            style={{
                position: 'absolute',
                right: -16,
                top: 0,
                width: 16,
                height: '100%',
                cursor: 'ew-resize',
                zIndex: 50,
                touchAction: 'none',
                background: 'transparent',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: 4,
                    height: '100%',
                    background: isDragging ? '#2563eb' : isHovered ? '#3b82f6' : 'transparent',
                    pointerEvents: 'none',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 16,
                    height: 40,
                    borderTopRightRadius: 6,
                    borderBottomRightRadius: 6,
                    background: isDragging ? '#2563eb' : isHovered ? '#3b82f6' : '#2f2f2f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    pointerEvents: 'none',
                }}
            >
                <div
                    style={{
                        width: 2,
                        height: 14,
                        background: '#8c8c8c',
                        borderRadius: 1,
                    }}
                />
                <div
                    style={{
                        width: 2,
                        height: 14,
                        background: '#8c8c8c',
                        borderRadius: 1,
                    }}
                />
            </div>
        </div>
    )
}
