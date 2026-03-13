export class NodeDOMRegistry {
    private map = new Map<string, HTMLElement>()

    public register(id: string, el: HTMLElement) {
        this.map.set(id, el)
    }

    public unregister(id: string) {
        this.map.delete(id)
    }

    public get(id: string) {
        return this.map.get(id)
    }

    public entries() {
        return this.map.entries()
    }

    public clear() {
        this.map.clear()
    }
}
