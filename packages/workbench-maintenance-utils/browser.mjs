export * from './src/browser/init.mjs'
export * from './src/browser/style.mjs'

let WorkbenchNavElement

/**
 * Gracefully handles environments without Custom Element support.
 * Throws an error on instantiation if Custom Elements are unavailable.
 */
if (
  typeof globalThis !== 'undefined' &&
  typeof globalThis.document !== 'undefined' &&
  typeof customElements !== 'undefined'
) {
  const { WorkbenchNavElement: ElementClass$1 } = await import(
    './src/browser.mjs'
  )
  WorkbenchNavElement = ElementClass$1
} else {
  WorkbenchNavElement = class NoOpWorkbenchNavElement {
    constructor() {
      throw new Error(
        'WorkbenchNavElement is not supported in this environment. ' +
          'Ensure you are running in a browser with support for Custom Elements.',
      )
    }
  }
}

export { WorkbenchNavElement }
