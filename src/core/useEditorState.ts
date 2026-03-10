import { useEffect, useState } from 'react'
import type { Editor } from '../core/Editor'

export function useEditorState(editor: Editor) {
    const [, update] = useState({})

    useEffect(() => {
        const unsubscribe = editor.subscribe(() => {
            update({})
        })

        return unsubscribe
    }, [editor])

    return editor.state
}
