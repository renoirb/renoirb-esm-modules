export * from './src/browser/context-api.mjs'

let MarkdownContentElement

/**
 * Gracefully handles environments without Custom Element support.
 * Throws an error on instantiation if Custom Elements are unavailable.
 */
if (
  typeof globalThis !== 'undefined' &&
  typeof globalThis.document !== 'undefined' &&
  typeof customElements !== 'undefined'
) {
  const { MarkdownContentElement: ElementClass$1 } = await import(
    './src/browser.mjs'
  )
  MarkdownContentElement = ElementClass$1
} else {
  MarkdownContentElement = class NoOpMarkdownContentElement {
    constructor() {
      throw new Error(
        'MarkdownContentElement is not supported in this environment. ' +
          'Ensure you are running in a browser with support for Custom Elements.',
      )
    }
  }
}

export { MarkdownContentElement }

export default MarkdownContentElement
