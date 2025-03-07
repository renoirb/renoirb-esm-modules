import {
  /*                    */
  WorkbenchNavElement,
} from './nav-element.mjs'
import {
  /*                    */
  attachDocumentStyle,
} from './style.mjs'

export const init = (w /*: Window */) => {
  w.customElements.define('workbench-nav', WorkbenchNavElement)
  attachDocumentStyle(w)
}
