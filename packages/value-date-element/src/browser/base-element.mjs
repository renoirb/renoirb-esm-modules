/**
 * ValueDateElement
 *
 * Displays a formatted date using the Context API for formatting.
 *
 * @author Renoir Boulanger
 */

import { ContextRequestEvent } from '@renoirb/context-api'
import {
  bindContextResponseHandlerMethodForDateContext,
  ContextRequest_DateConversion,
} from './context-api.mjs'

export const STYLE = `
  :host {
    display: inline;
  }
  :host([data-state="resolving"]) time {
    /* Don't hide the text entirely, make it slightly visible */
    opacity: 0.6;
    position: relative;
  }
  :host([data-state="resolving"]) time::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(90deg, #eee, #ddd, #eee);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 3px;
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  :host([data-state="timeout"]) time {
    color: #999;
  }
  :host([data-state="resolved"]) time {
    transition: color 0.3s ease-out;
  }
`

const ATTRIBUTES = {
  date: {
    name: 'data-date',
  },
  dateFormat: {
    name: 'data-date-format',
  },
  dateLocale: {
    name: 'data-date-locale',
  },
}

export class ValueDateElement extends HTMLElement {
  static get observedAttributes() {
    return Object.values(ATTRIBUTES).map(({ name }) => name)
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
    // Set default attributes
    for (const [_prop, config] of Object.entries(ATTRIBUTES)) {
      if (config.default && !this.hasAttribute(config.name)) {
        this.setAttribute(config.name, config.default)
      }
    }
    const dateValue = this.getAttribute(ATTRIBUTES.date.name)
    if (dateValue) {
      this.#setValue(dateValue)
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.isConnected) {
      return
    }
    if (name === ATTRIBUTES.date.name) {
      this.#setValue(newValue)
    }
  }


  #setValue(value) {
    if (typeof value === 'string') {
      const subjectEl = this.shadowRoot.querySelector('time')
      subjectEl.innerText = value
      subjectEl.setAttribute('datetime', value)
      this.#requestDateFormatting()
    }
  }

  #requestDateFormatting() {
    this.setAttribute('data-state', 'resolving')
    this.dispatchEvent(
      new ContextRequestEvent(
        ContextRequest_DateConversion,
        this,
        this._onDateConversionContextEvent,
      ),
    )
    // Set timeout for resolving state
    setTimeout(() => {
      if (this.getAttribute('data-state') === 'resolving') {
        this.setAttribute('data-state', 'timeout')
      }
    }, 5_000)
  }
}
