import type { ComponentType } from 'react'

export class PropertyControlRegistry {
    private controls = new Map<string, ComponentType<any>>()

    register(type: string, component: ComponentType<any>) {
        this.controls.set(type, component)
    }

    get(type: string) {
        return this.controls.get(type)
    }
}
