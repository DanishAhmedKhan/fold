export type EditorPatch =
    | { type: 'ADD_NODE'; nodeId: string }
    | { type: 'REMOVE_NODE'; nodeId: string }
    | { type: 'MOVE_NODE'; nodeId: string }
    | { type: 'UPDATE_STYLE'; nodeId: string }
    | { type: 'REMOVE_STYLE'; nodeId: string }
    | { type: 'UPDATE_PROPS'; nodeId: string }
    | { type: 'SELECT_NODE'; nodeId: string | null }
    | { type: 'SELECT_NODES'; nodeIds: string[] }
    | { type: 'TOGGLE_NODE_SELECTION'; nodeId: string }
    | { type: 'CLEAR_SELECTION' }
    | { type: 'HOVER_NODE'; nodeId: string | null }
    | { type: 'CLEAR_HOVER' }
