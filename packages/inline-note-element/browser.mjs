let InlineNoteElement

/**
 * Gracefully handles environments without Custom Element support.
 * Throws an error on instantiation if Custom Elements are unavailable.
 */
if (
  typeof globalThis !== 'undefined' &&
  typeof globalThis.document !== 'undefined' &&
  typeof customElements !== 'undefined'
) {
  const { InlineNoteElement: ElementClass$1 } = await import(
    './src/browser.mjs'
  )
  InlineNoteElement = ElementClass$1
} else {
  InlineNoteElement = class NoOpInlineNoteElement {
    constructor() {
      throw new Error(
        'InlineNoteElement is not supported in this environment. ' +
          'Ensure you are running in a browser with support for Custom Elements.',
      )
    }
  }
}

export { InlineNoteElement }

export default InlineNoteElement
