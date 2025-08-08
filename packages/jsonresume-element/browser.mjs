export * from './src/browser/context-api.mjs'

let JsonResumeElement
let WorkExperienceElement

/**
 * Gracefully handles environments without Custom Element support.
 * Throws an error on instantiation if Custom Elements are unavailable.
 */
if (
  typeof globalThis !== 'undefined' &&
  typeof globalThis.document !== 'undefined' &&
  typeof customElements !== 'undefined'
) {
  const {
    JsonResumeElement: ElementClass$1,
    WorkExperienceElement: ElementClass$2,
  } = await import('./src/browser.mjs')
  JsonResumeElement = ElementClass$1
  WorkExperienceElement = ElementClass$2
} else {
  JsonResumeElement = class NoOpJsonResumeElement {
    constructor() {
      throw new Error(
        'JsonResumeElement is not supported in this environment. ' +
          'Ensure you are running in a browser with support for Custom Elements.',
      )
    }
  }
  WorkExperienceElement = class NoOpJsonResumeElement {
    constructor() {
      throw new Error(
        'WorkExperienceElement is not supported in this environment. ' +
          'Ensure you are running in a browser with support for Custom Elements.',
      )
    }
  }
}

export {
  /*                    */
  JsonResumeElement,
  WorkExperienceElement,
}

export default JsonResumeElement
