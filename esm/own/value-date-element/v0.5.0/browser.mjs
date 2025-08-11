export * from './src/browser.mjs'

let ValueDateElement
let ValueDateRangeElement

/**
 * Gracefully handles environments without Custom Element support.
 * Throws an error on instantiation if Custom Elements are unavailable.
 */
if (
  typeof globalThis !== 'undefined' &&
  typeof globalThis.document !== 'undefined' &&
  typeof customElements !== 'undefined'
) {
  const { ValueDateElement: ElementClass$1 } = await import('./src/browser.mjs')
  ValueDateElement = ElementClass$1
  const { ValueDateRangeElement: ElementClass$2 } = await import('./src/browser.mjs')
  ValueDateRangeElement = ElementClass$2
} else {
  ValueDateElement = class NoOpValueDateElement {
    constructor() {
      throw new Error(
        'ValueDateElement is not supported in this environment. ' +
          'Ensure you are running in a browser with support for Custom Elements.',
      )
    }
  }
  ValueDateRangeElement = class NoOpValueDateRangeElement {
    constructor() {
      throw new Error(
        'ValueDateRangeElement is not supported in this environment. ' +
          'Ensure you are running in a browser with support for Custom Elements.',
      )
    }
  }
}

export {
  /*                    */
  ValueDateElement,
  ValueDateRangeElement,
}

export default ValueDateElement
