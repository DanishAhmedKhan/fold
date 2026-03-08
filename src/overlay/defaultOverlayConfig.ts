import type { OverlayConfig } from './OverlatConfig'

export const defaultOverlayConfig: OverlayConfig = {
    defaultHoverColor: '#999',
    defaultSelectionColor: '#3b82f6',

    elements: {},

    actionBar: {
        orientation: 'horizontal',
        placement: 'top-right',
        inside: false,
    },

    showElementName: true,
    showAddButton: true,
}
