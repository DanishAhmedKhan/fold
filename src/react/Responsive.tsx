import type { Editor } from '../core/Editor'

export function Responsive({ editor }: { editor: Editor }) {
    return (
        <div
            style={{
                display: 'flex',
                gap: 10,
            }}
        >
            <button onClick={() => editor.setDevice('desktop')}>Desktop</button>

            <button onClick={() => editor.setDevice('tablet')}>Tablet</button>

            <button onClick={() => editor.setDevice('mobile')}>Mobile</button>

            <button onClick={() => editor.setResponsiveMode()}>Responsive</button>
        </div>
    )
}
