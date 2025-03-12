export * from './src/browser/utils.mjs'

let NoticeBoxElement

/**
 * Gracefully handles environments without Custom Element support.
 * Throws an error on instantiation if Custom Elements are unavailable.
 */
if (
  typeof globalThis !== 'undefined' &&
  typeof globalThis.document !== 'undefined' &&
  typeof customElements !== 'undefined'
) {
  const { NoticeBoxElement: ElementClass } = await import('./src/browser.mjs')
  NoticeBoxElement = ElementClass
} else {
  NoticeBoxElement = class NoOpNoticeBoxElement {
    constructor() {
      throw new Error(
        'NoticeBoxElement is not supported in this environment. ' +
          'Ensure you are running in a browser with support for Custom Elements.',
      )
    }
  }
}

export { NoticeBoxElement }

export default NoticeBoxElement
