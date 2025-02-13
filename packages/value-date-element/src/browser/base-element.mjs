import { ContextRequestEvent } from 'https://renoirb.com/esm-modules/context-api'
import {
  bindContextResponseHandlerMethodForDateContext,
  ContextRequest_DateConversion,
} from './context-api.mjs'


export const STYLE = `
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
    styleElement.replaceSync(STYLE)
    this.shadowRoot.adoptedStyleSheets = [styleElement]
    this._onDateConversionContextEvent = bindContextResponseHandlerMethodForDateContext(this)
    Reflect.set(this._onDateConversionContextEvent, '__temporary_hack__', this)
    //                                              ^ Yes this is ugly ^
    // To my recollection, the point of this.dispatchEvent() is to tell who emitted the event
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
          this._onDateConversionContextEvent,
          // ^ Yes this is ugly: Gotta remember what I forgotten here.
        ),
      )
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'datetime' && oldValue !== newValue) {
      this.dispatchEvent(
        new ContextRequestEvent(
          ContextRequest_DateConversion,
          this._onDateConversionContextEvent,
        ),
      )
    }
  }
}
