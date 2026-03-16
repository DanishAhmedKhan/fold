import type { ResponsiveStyles } from '../core/types'

export class IframeStyleSheetManager {
    private doc!: Document
    private styleEl!: HTMLStyleElement
    private sheet!: CSSStyleSheet

    public mount(doc: Document) {
        this.doc = doc

        this.styleEl = doc.createElement('style')
        this.styleEl.id = 'fold-editor-styles'

        doc.head.appendChild(this.styleEl)

        this.sheet = this.styleEl.sheet as CSSStyleSheet
    }

    updateNodeStyles(nodeId: string, styles: ResponsiveStyles = {}) {
        const selector = `.fe-node-${nodeId}`

        this.removeNodeStyles(nodeId)

        const desktop = this.buildRule(selector, styles.desktop)

        if (desktop) {
            this.sheet.insertRule(desktop)
        }

        if (styles.tablet && Object.keys(styles.tablet).length) {
            const tabletRule = this.buildRule(selector, styles.tablet)

            if (tabletRule) {
                this.sheet.insertRule(`@media (max-width:1024px){${tabletRule}}`)
            }
        }

        if (styles.mobile && Object.keys(styles.mobile).length) {
            const mobileRule = this.buildRule(selector, styles.mobile)

            if (mobileRule) {
                this.sheet.insertRule(`@media (max-width:768px){${mobileRule}}`)
            }
        }
    }

    public removeNodeStyles(nodeId: string) {
        const selector = `.fe-node-${nodeId}`

        for (let i = this.sheet.cssRules.length - 1; i >= 0; i--) {
            const rule = this.sheet.cssRules[i]

            if (rule.cssText.includes(selector)) {
                this.sheet.deleteRule(i)
            }
        }
    }

    private buildRule(selector: string, styles?: Record<string, string>) {
        if (!styles || Object.keys(styles).length === 0) return null

        const body = Object.entries(styles)
            .map(([k, v]) => `${this.toCssProp(k)}:${v};`)
            .join('')

        return `${selector}{${body}}`
    }

    private toCssProp(prop: string) {
        return prop.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
    }
}
