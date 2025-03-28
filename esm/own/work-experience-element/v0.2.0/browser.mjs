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
  const { WorkExperienceElement: ElementClass$1 } = await import(
    './src/browser.mjs'
  )
  WorkExperienceElement = ElementClass$1
} else {
  WorkExperienceElement = class NoOpWorkExperienceElement {
    constructor() {
      throw new Error(
        'WorkExperienceElement is not supported in this environment. ' +
          'Ensure you are running in a browser with support for Custom Elements.',
      )
    }
  }
}

export { WorkExperienceElement }

export default WorkExperienceElement
