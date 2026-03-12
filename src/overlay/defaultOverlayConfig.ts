import type { OverlayConfig } from './OverlatConfig'

export const defaultOverlayConfig: OverlayConfig = {
    hover: {
        color: '#999',
        width: 1,
        style: 'dashed',
    },

    selection: {
        color: '#3b82f6',
        width: 2,
        style: 'solid',
    },

    bars: [
        {
            id: 'actions',

            position: 'top',
            align: 'end',
            offset: 'outside',

            orientation: 'horizontal',

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

            visibility: {
                hover: true,
                selection: true,
            },
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
            offset: 'middle',

            orientation: 'horizontal',

            actions: [
                {
                    id: 'add',
                    icon: '+',
                    tooltip: 'Add Element',
                },
            ],

            style: {
                borderRadius: '50%',
            },
        },
    ],
}
