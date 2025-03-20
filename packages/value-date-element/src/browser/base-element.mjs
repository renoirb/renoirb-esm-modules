import { ContextRequestEvent } from '@renoirb/context-api'
import {
  bindContextResponseHandlerMethodForDateContext,
  ContextRequest_DateConversion,
} from './context-api.mjs'

export const STYLE = `
  :host {
    display: inline;
  }

  :host([data-state="loading"]) time {
    position: relative;
    color: transparent;
  }
  :host([data-state="loading"]) time::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 1em;
    background: linear-gradient(90deg, #eee, #ddd, #eee);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  :host([data-state="timeout"]) time {
    color: #999;
  }
  :host([data-state="loaded"]) time {
    transition: color 0.3s ease-out;
  }
`

export class ValueDateElement extends HTMLElement {
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
    this._onDateConversionContextEvent =
      bindContextResponseHandlerMethodForDateContext(this)
  }

  connectedCallback() {
    const datetime = this.getAttribute('datetime')
    if (datetime) {
      this.shadowRoot.host.setAttribute('data-state', 'loading')

      const timeEl = this.shadowRoot.querySelector('time')
      timeEl.innerText = '...' // Placeholder
      timeEl.setAttribute('datetime', datetime)

      const contextRequest = new ContextRequestEvent(
        ContextRequest_DateConversion,
        this,
        (data) => {
          this._onDateConversionContextEvent(data)
          this.shadowRoot.host.setAttribute('data-state', 'loaded')
        }
      )
      this.dispatchEvent(contextRequest)

      // Optional timeout for long-running requests
      setTimeout(() => {
        if (this.shadowRoot.host.getAttribute('data-state') === 'loading') {
          this.shadowRoot.host.setAttribute('data-state', 'timeout')
        }
      }, 5000)
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
