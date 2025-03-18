
let JsonResumeParentElement

/**
 * Gracefully handles environments without Custom Element support.
 * Throws an error on instantiation if Custom Elements are unavailable.
 */
if (
  typeof globalThis !== 'undefined' &&
  typeof globalThis.document !== 'undefined' &&
  typeof customElements !== 'undefined'
) {
  const { JsonResumeParentElement: ElementClass$1 } = await import('./src/browser.mjs')
  JsonResumeParentElement = ElementClass$1
} else {
  JsonResumeParentElement = class NoOpJsonResumeParentElement {
    constructor() {
      throw new Error(
        'JsonResumeParentElement is not supported in this environment. ' +
          'Ensure you are running in a browser with support for Custom Elements.',
      )
    }
  }
}

export {
  /*                    */
  JsonResumeParentElement,
}

export default JsonResumeParentElement
