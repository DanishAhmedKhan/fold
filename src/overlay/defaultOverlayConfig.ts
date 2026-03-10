import type { OverlayConfig } from './OverlatConfig'

export const defaultOverlayConfig: OverlayConfig = {
    defaultHoverColor: '#999',

    defaultSelectionColor: '#3b82f6',

    bars: [
        {
            id: 'actions',

            position: 'top',
            align: 'end',
            offset: 'outside',

            orientation: 'horizontal',

            // gap: 6,

            flipMode: 'both',

            actions: [
                {
                    id: 'move',
                    icon: '⋮⋮',
                    tooltip: 'Drag',
                },

                {
                    id: 'duplicate',
                    icon: '⧉',
                    tooltip: 'Duplicate',
                },

                {
                    id: 'delete',
                    icon: '🗑',
                    tooltip: 'Delete',
                    onClick: (editor, nodeId) => {
                        // editor.delete(nodeId)
                    },
                },
            ],
        },

        {
            id: 'label',

            position: 'top',
            align: 'start',
            offset: 'outside',

            orientation: 'horizontal',

            flipMode: 'offset',

            actions: [
                {
                    id: 'element-label',
                    label: 'Element',
                },
            ],
        },

        {
            id: 'add',

            position: 'bottom',
            align: 'center',
            offset: 'outside',

            orientation: 'horizontal',

            actions: [
                {
                    id: 'add',
                    icon: '+',
                    tooltip: 'Add Element',
                },
            ],
        },
    ],
}
