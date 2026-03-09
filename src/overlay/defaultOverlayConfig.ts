import type { OverlayConfig } from './OverlatConfig'

export const defaultOverlayConfig: OverlayConfig = {
    defaultHoverColor: 'red',
    defaultSelectionColor: 'green',

    elements: {},

    actionBar: {
        orientation: 'horizontal',
        placement: 'top-right',
        inside: true,
    },

    showElementName: true,
    showAddButton: true,
}
