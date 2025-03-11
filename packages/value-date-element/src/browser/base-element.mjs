import { ContextRequestEvent } from '@renoirb/context-api'
import {
  bindContextResponseHandlerMethodForDateContext,
  ContextRequest_DateConversion,
} from './context-api.mjs'

export const BASE_VALUE_ELEMENT_STYLE = `
  :host {
    display: inline;
  }
`

export class BaseValueDateElement extends HTMLElement {
  static get observedAttributes() {
    return ['datetime']
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    const timeEl = document.createElement('time')
    this.shadowRoot.appendChild(timeEl)
    const styleElement = new CSSStyleSheet()
    styleElement.replaceSync(BASE_VALUE_ELEMENT_STYLE)
    this.shadowRoot.adoptedStyleSheets = [styleElement]
    this._onDateConversionContextEvent =
      bindContextResponseHandlerMethodForDateContext(this)
  }

  connectedCallback() {
    const datetime = this.getAttribute('datetime')
    if (datetime) {
      const subjectEl = this.shadowRoot.querySelector('time')
      subjectEl.innerText = datetime
      subjectEl.setAttribute('datetime', datetime)
      this.dispatchEvent(
        new ContextRequestEvent(
          ContextRequest_DateConversion,
          this,
          this._onDateConversionContextEvent,
        ),
      )
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'datetime' && oldValue !== newValue) {
      this.dispatchEvent(
        new ContextRequestEvent(
          ContextRequest_DateConversion,
          this,
          this._onDateConversionContextEvent,
        ),
      )
    }
  }
}
