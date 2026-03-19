import type { OverlayConfig } from './OverlatConfig'

export const defaultOverlayConfig: OverlayConfig = {
    hover: {
        borderStyle: {
            color: '#999',
            width: 2,
            style: 'solid',
        },
        index: 9999,
    },

    selection: {
        borderStyle: {
            color: '#3b82f6',
            width: 2,
            style: 'solid',
        },
        index: 999,
    },

    bars: [
        {
            id: 'actions',

            position: 'top',
            align: 'end',
            offset: 'outside',

            orientation: 'horizontal',

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
                    // label: 'Element',
                    label: '${element.type}',
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

            visibility: {
                hover: false,
            },
        },
    ],
}
