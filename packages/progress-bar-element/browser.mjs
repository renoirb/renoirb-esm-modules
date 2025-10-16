let ProgressBarElement

/**
 * Gracefully handles environments without Custom Element support.
 * Throws an error on instantiation if Custom Elements are unavailable.
 */
if (
  typeof globalThis !== 'undefined' &&
  typeof globalThis.document !== 'undefined' &&
  typeof customElements !== 'undefined'
) {
  const { ProgressBarElement: ElementClass } = await import('./src/browser.mjs')
  ProgressBarElement = ElementClass
} else {
  ProgressBarElement = class NoOpProgressBarElement {
    constructor() {
      throw new Error(
        'ProgressBarElement is not supported in this environment. ' +
          'Ensure you are running in a browser with support for Custom Elements.',
      )
    }
  }
}

export { ProgressBarElement }

export default ProgressBarElement
