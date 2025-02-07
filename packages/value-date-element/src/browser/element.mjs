import { ContextRequestEvent } from 'https://renoirb.com/esm-modules/context-api'
import {
  bindContextResponseHandlerMethodForDateContext,
  ContextRequest_DateConversion,
} from './context-api.mjs'

export class BaseValueDateElement extends HTMLElement {
  static get observedAttributes() {
    return ['datetime']
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    const timeEl = document.createElement('time')
    this.shadowRoot.appendChild(timeEl)
    this._onDateConversionContextEvent =
      bindContextResponseHandlerMethodForDateContext(this)
  }

  connectedCallback() {
    const datetime = this.getAttribute('datetime')
    this.shadowRoot.querySelector('time').innerText = datetime
    if (datetime) {
      this.dispatchEvent(
        new ContextRequestEvent(ContextRequest_DateConversion, (e) => {
          this._onDateConversionContextEvent(e)
        }),
      )
    }
  }
}

export default BaseValueDateElement
