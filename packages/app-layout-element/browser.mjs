let AppLayoutAlphaElement
let AppLayoutGreyElement

/**
 * Gracefully handles environments without Custom Element support.
 * Throws an error on instantiation if Custom Elements are unavailable.
 */
if (
  typeof globalThis !== 'undefined' &&
  typeof globalThis.document !== 'undefined' &&
  typeof customElements !== 'undefined'
) {
  const { AppLayoutAlphaElement: ElementClass$1 } = await import(
    './src/browser.mjs'
  )
  AppLayoutAlphaElement = ElementClass$1
  const { AppLayoutGreyElement: ElementClass$2 } = await import(
    './src/browser.mjs'
  )
  AppLayoutGreyElement = ElementClass$2
} else {
  AppLayoutAlphaElement = class NoOpAppLayoutAlphaElement {
    constructor() {
      throw new Error(
        'AppLayoutAlphaElement is not supported in this environment. ' +
          'Ensure you are running in a browser with support for Custom Elements.',
      )
    }
  }
  AppLayoutGreyElement = class NoOpAppLayoutGreyElement {
    constructor() {
      throw new Error(
        'AppLayoutGreyElement is not supported in this environment. ' +
          'Ensure you are running in a browser with support for Custom Elements.',
      )
    }
  }
}

export {
  /*                    */
  AppLayoutAlphaElement,
  AppLayoutGreyElement,
}

export default AppLayoutAlphaElement
