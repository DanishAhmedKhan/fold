// import type { ResponsiveStyles } from '../core/types'

// export class IframeStyleSheetManager {
//     private doc!: Document
//     private styleEl!: HTMLStyleElement
//     private sheet!: CSSStyleSheet

//     public mount(doc: Document) {
//         this.doc = doc

//         this.styleEl = doc.createElement('style')
//         this.styleEl.id = 'fold-editor-styles'

//         doc.head.appendChild(this.styleEl)

//         this.sheet = this.styleEl.sheet as CSSStyleSheet
//     }

//     public updateNodeStyles(nodeId: string, styles: ResponsiveStyles = {}) {
//         const selector = `.fe-node-${nodeId}`

//         this.removeNodeStyles(nodeId)

//         const desktop = this.buildRule(selector, styles.desktop)

//         if (desktop) {
//             this.sheet.insertRule(desktop)
//         }

//         if (styles.tablet && Object.keys(styles.tablet).length) {
//             const tabletRule = this.buildRule(selector, styles.tablet)

//             if (tabletRule) {
//                 this.sheet.insertRule(`@media (max-width:1024px){${tabletRule}}`)
//             }
//         }

//         if (styles.mobile && Object.keys(styles.mobile).length) {
//             const mobileRule = this.buildRule(selector, styles.mobile)

//             if (mobileRule) {
//                 this.sheet.insertRule(`@media (max-width:768px){${mobileRule}}`)
//             }
//         }
//     }

//     public removeNodeStyles(nodeId: string) {
//         const selector = `.fe-node-${nodeId}`

//         for (let i = this.sheet.cssRules.length - 1; i >= 0; i--) {
//             const rule = this.sheet.cssRules[i]

//             if (rule.cssText.includes(selector)) {
//                 this.sheet.deleteRule(i)
//             }
//         }
//     }

//     private buildRule(selector: string, styles?: Record<string, string>) {
//         if (!styles || Object.keys(styles).length === 0) return null

//         const body = Object.entries(styles)
//             .map(([k, v]) => `${this.toCssProp(k)}:${v};`)
//             .join('')

//         return `${selector}{${body}}`
//     }

//     private toCssProp(prop: string) {
//         return prop.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
//     }
// }

import type { ResponsiveStyles } from '../core/types'

type NodeStyleMap = Map<string, ResponsiveStyles>

export class IframeStyleSheetManager {
    private doc!: Document
    private styleEl!: HTMLStyleElement

    private nodeStyles: NodeStyleMap = new Map()

    public mount(doc: Document) {
        this.doc = doc

        this.styleEl = doc.createElement('style')
        this.styleEl.id = 'fold-editor-styles'

        doc.head.appendChild(this.styleEl)
    }

    public updateNodeStyles(nodeId: string, styles: ResponsiveStyles = {}) {
        this.nodeStyles.set(nodeId, styles)
        this.render()
    }

    public removeNodeStyles(nodeId: string) {
        this.nodeStyles.delete(nodeId)
        this.render()
    }

    private render() {
        let desktopCSS = ''
        let tabletCSS = ''
        let mobileCSS = ''

        for (const [nodeId, styles] of this.nodeStyles) {
            const selector = `.fe-node-${nodeId}`

            const desktopRule = this.buildRule(selector, styles.desktop)
            if (desktopRule) desktopCSS += desktopRule

            const tabletRule = this.buildRule(selector, styles.tablet)
            if (tabletRule) tabletCSS += tabletRule

            const mobileRule = this.buildRule(selector, styles.mobile)
            if (mobileRule) mobileCSS += mobileRule
        }

        let css = desktopCSS

        if (tabletCSS) {
            css += `@media (max-width:1024px){${tabletCSS}}`
        }

        if (mobileCSS) {
            css += `@media (max-width:768px){${mobileCSS}}`
        }

        this.styleEl.textContent = css
    }

    private buildRule(selector: string, styles?: Record<string, string>) {
        if (!styles || Object.keys(styles).length === 0) return ''

        const body = Object.entries(styles)
            .map(([k, v]) => `${this.toCssProp(k)}:${v};`)
            .join('')

        return `${selector}{${body}}`
    }

    private toCssProp(prop: string) {
        return prop.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
    }
}
