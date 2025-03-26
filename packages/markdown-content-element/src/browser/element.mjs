import {
  /*                    */
  ContextRequestEvent,
} from '@renoirb/context-api'
import {
  /*                    */
  ContextRequest_MarkdownContent,
} from './context-api.mjs'

export const TEMPLATE = `
  <div class="disposition-parent is-not-transformed" id="root">
    <div
      id="markdown-viewer"
      part="markdown-viewer"
      class="disposition-item"
    >
      <div id="markdown-loading">
        <slot name="skeleton">
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_ajPY{transform-origin:center;animation:spinner_AtaB .75s infinite linear}@keyframes spinner_AtaB{100%{transform:rotate(360deg)}}</style><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25" /><path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z" class="spinner_ajPY" /></svg>
        </slot>
      </div>
      <div id="markdown-transformed"></div>
    </div>
    <div
      id="markdown-source"
      part="markdown-source"
      class="disposition-item"
    >
      <pre>
        <slot></slot>
      </pre>
    </div>
  </div>
`

export const STYLE = `
  :host {
    display: block;
  }

  #markdown-source {
    display: none;
  }
  .is-not-transformed #markdown-loading {
    display: block;
  }
  .is-not-transformed #markdown-transformed {
    display: none;
  }
  .is-transformed #markdown-loading {
    display: none !important;
  }
  .is-transformed #markdown-transformed {
    display: block;
  }

  /* Transition styles */
  :host([data-transition="none"]) #markdown-loading {
    display: none !important;
  }
  :host([data-transition="none"]) #markdown-source {
    display: block !important;
  }
  :host([data-transition="none"]) .is-transformed #markdown-source {
    display: none !important;
  }
  :host([data-transition="spinner"]) #markdown-loading {
    display: block !important;
  }
  :host([data-transition="spinner"]) #markdown-source {
    display: none !important;
  }

  /* Add this rule to handle the transformed state with spinner transition */
  :host([data-transition="spinner"]) .is-transformed #markdown-loading {
    display: none !important;
  }
`

const ATTRIBUTES = {
  transition: {
    name: 'data-transition',
    values: ['spinner', 'none'],
    default: 'none',
  },
}

export class MarkdownContentElement extends HTMLElement {
  static get observedAttributes() {
    return Object.values(ATTRIBUTES).map(({ name }) => name)
  }

  constructor() {
    super()

    this.attachShadow({ mode: 'open' })
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(STYLE)
    this.shadowRoot.adoptedStyleSheets = [sheet]

    const template = document.createElement('template')
    template.innerHTML = TEMPLATE
    this.shadowRoot.appendChild(template.content.cloneNode(true))
    const slot = this.shadowRoot.querySelector('slot:not([name])')
    slot.addEventListener('slotchange', this.#onSlotChange)
  }

  connectedCallback() {
    for (const [_prop, config] of Object.entries(ATTRIBUTES)) {
      if (!this.hasAttribute(config.name) && config.default) {
        this.setAttribute(config.name, config.default)
      }
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return
    }
    const attrConfig = Object.values(ATTRIBUTES).find((a) => a.name === name)
    if (!attrConfig) {
      return
    }

    // Validate and fix if needed
    if (!attrConfig.values.includes(newValue)) {
      const acceptable = '[' + attrConfig.values.join(', ') + ']'
      const message = `Invalid ${name}: "${newValue}". Valid values are: ${acceptable}. Using default.`
      console.warn(message)
      this.setAttribute(name, attrConfig.default)
      return
    }
  }

  #updateMarkdownTransformed = (html = '') => {
    const transformed = html !== ''
    const elementViewer = this.shadowRoot.querySelector('#root')
    const elementMarkdownTransformed = this.shadowRoot.querySelector(
      '#markdown-transformed',
    )
    if (transformed) {
      elementMarkdownTransformed.innerHTML = html
      elementViewer.classList.remove('is-not-transformed')
      elementViewer.classList.add('is-transformed')
    } else {
      elementMarkdownTransformed.innerHTML = ''
      elementViewer.classList.add('is-not-transformed')
      elementViewer.classList.remove('is-transformed')
    }
  }

  /**
   * Listen on changes only on default slot, that's the trigger to ask for HTML.
   */
  #onSlotChange = (_event /*: HTMLElementEventMap['slotchange'] */) => {
    this.dispatchEvent(
      new ContextRequestEvent(
        ContextRequest_MarkdownContent,
        this,
        this.#onMarkdownContextEvent,
      ),
    )
  }

  #onMarkdownContextEvent = ({ html = '' }) => {
    this.#updateMarkdownTransformed(html)
  }
}
