export type EditorPatch =
    | { type: 'ADD_NODE'; nodeId: string }
    | { type: 'REMOVE_NODE'; nodeId: string }
    | { type: 'MOVE_NODE'; nodeId: string }
    | { type: 'UPDATE_STYLE'; nodeId: string }
    | { type: 'REMOVE_STYLE'; nodeId: string }
    | { type: 'UPDATE_PROPS'; nodeId: string }
    | { type: 'SELECT_NODE'; nodeId: string | null }
    | { type: 'HOVER_NODE'; nodeId: string | null }
    | { type: 'CLEAR_HOVER' }
