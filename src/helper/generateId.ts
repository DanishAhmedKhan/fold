export function generateId() {
    return 'node_' + Math.random().toString(36).slice(2, 9)
}
