import type { OverlayConfig } from './OverlatConfig'

export const defaultOverlayConfig: OverlayConfig = {
    defaultHoverColor: 'red',
    defaultSelectionColor: 'green',

    elements: {},

    actionBar: {
        position: 'top',
        align: 'end',
        offset: 'outside',
        gap: 0,

        actions: [
            {
                id: 'duplicate',
                icon: '⧉',
                tooltip: 'Duplicate',

                onClick(editor, nodeId) {
                    editor.duplicateNode(nodeId)
                },
            },

            {
                id: 'delete',
                icon: '🗑',
                tooltip: 'Delete',

                onClick(editor, nodeId) {
                    editor.removeNode(nodeId)
                },
            },
        ],
    },

    showElementName: true,
    showAddButton: true,
}
