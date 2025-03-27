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
    return [...Object.values(ATTRIBUTES).map(({ name }) => name), 'datetime']
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

    // Get date from either attribute (prioritize data-date)
    const dateValue =
      this.getAttribute(ATTRIBUTES.date.name) || this.getAttribute('datetime')

    if (dateValue) {
      // Sync the attributes without triggering loops
      this._syncingAttributes = true

      if (!this.hasAttribute(ATTRIBUTES.date.name)) {
        this.setAttribute(ATTRIBUTES.date.name, dateValue)
      }
      if (!this.hasAttribute('datetime')) {
        this.setAttribute('datetime', dateValue)
      }

      this._syncingAttributes = false

      // Initialize the time element
      const timeEl = this.shadowRoot.querySelector('time')
      timeEl.setAttribute('datetime', dateValue)

      // Request formatting
      this.#requestDateFormatting()
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || this._syncingAttributes || !this.isConnected) {
      return
    }

    this._syncingAttributes = true

    // Handle attribute syncing
    if (
      name === 'datetime' &&
      newValue !== this.getAttribute(ATTRIBUTES.date.name)
    ) {
      this.setAttribute(ATTRIBUTES.date.name, newValue)
    } else if (
      name === ATTRIBUTES.date.name &&
      newValue !== this.getAttribute('datetime')
    ) {
      this.setAttribute('datetime', newValue)
    }

    this._syncingAttributes = false

    // Only request formatting for value changes
    if (name === 'datetime' || name === ATTRIBUTES.date.name) {
      this.#requestDateFormatting()
    }
  }

  #requestDateFormatting() {
    this.setAttribute('data-state', 'loading')
    this.dispatchEvent(
      new ContextRequestEvent(ContextRequest_DateConversion, this, (data) => {
        this._onDateConversionContextEvent(data)
        this.setAttribute('data-state', 'loaded')
      }),
    )

    // Set timeout for loading state
    setTimeout(() => {
      if (this.getAttribute('data-state') === 'loading') {
        this.setAttribute('data-state', 'timeout')
      }
    }, 5000)
  }
}
