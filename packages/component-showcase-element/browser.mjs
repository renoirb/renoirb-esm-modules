export * from './src/browser/utils.mjs'

let ComponentShowcaseElement

/**
 * Gracefully handles environments without Custom Element support.
 * Throws an error on instantiation if Custom Elements are unavailable.
 */
if (
  typeof globalThis !== 'undefined' &&
  typeof globalThis.document !== 'undefined' &&
  typeof customElements !== 'undefined'
) {
  const { ComponentShowcaseElement: ElementClass$1 } = await import(
    './src/browser.mjs'
  )
  ComponentShowcaseElement = ElementClass$1
} else {
  ComponentShowcaseElement = class NoOpComponentShowcaseElement {
    constructor() {
      throw new Error(
        'ComponentShowcaseElement is not supported in this environment. ' +
          'Ensure you are running in a browser with support for Custom Elements.',
      )
    }
  }
}

export { ComponentShowcaseElement }

export default ComponentShowcaseElement
