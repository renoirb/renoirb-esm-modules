import {
  /*                          */
  validateSlotsList,
} from './utils.mjs'

const STYLE = `
  :host {
    display: block;
    margin: 2rem 0;
    padding: 1rem;
    border: 1px solid #eee;
    border-radius: 0.5rem;
  }

  .title {
    margin: 0 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
  }

  .variants {
    display: grid;
    gap: 1rem;
  }
`

const TEMPLATE = `
  <div class="showcase">
    <h2 class="title"></h2>
    <div class="variants"></div>
  </div>
`

class ComponentShowcase extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'slots']
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
  }

  connectedCallback() {
    try {
      this._render()
    } catch (error) {
      this._renderError(error)
    }
  }

  _renderError(error) {
    // Clear existing content
    const showcase = this.shadowRoot.querySelector('.showcase')
    showcase.innerHTML = `
      <div class="error" style="color: red; padding: 1rem; border: 1px solid red;">
        <strong>Error:</strong> ${error.message}
      </div>
    `
  }

  _render() {
    // Validate name
    const name = this.getAttribute('name')
    if (!name?.trim()) {
      throw new Error('name attribute is required')
    }

    // Set title
    this.shadowRoot.querySelector('.title').textContent = name.trim()

    // Validate and normalize slots
    const slots = validateSlotsList(this.getAttribute('slots'))
    const variants = this.shadowRoot.querySelector('.variants')
    variants.innerHTML = '' // Clear existing content

    slots.forEach((slot) => {
      const templates = this.querySelectorAll(`template[slot="${slot}"]`)
      if (templates.length === 0) {
        throw new Error(`No content found for slot "${slot}"`)
      }

      templates.forEach((template) => {
        const container = document.createElement('div')
        container.className = 'variant'

        // Add title if present
        const title = template.getAttribute('title')?.trim()
        if (title) {
          const titleEl = document.createElement('h3')
          titleEl.className = 'variant-title'
          titleEl.textContent = title
          container.appendChild(titleEl)
        }

        container.appendChild(template.content.cloneNode(true))
        variants.appendChild(container)
      })
    })
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      try {
        this._render()
      } catch (error) {
        this._renderError(error)
      }
    }
  }
}

export default ComponentShowcase
