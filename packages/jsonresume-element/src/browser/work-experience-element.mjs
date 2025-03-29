import {
  /*                    */
  getShortFormIso8601Date,
} from '@renoirb/value-date-element'

/**
 * Work Experience Element
 *
 * A custom element for displaying work experience entries with proper date formatting.
 * Uses data attributes for configuration and relies on date formatting custom elements.
 *
 * Created with assistance from Claude (Anthropic), March 20, 2025
 *
 * @author Renoir
 * @contributor Claude AI
 */

/**
 * The following is scavenged markup from JSONResume Registry for now
 * https://registry.jsonresume.org/renoirb
 */
const TEMPLATE = `
  <div class="p-experience">
    <p
      class="clear-margin relative"
      part="experience-header"
    >
      <strong id="position-display"></strong><span id="entity-display"></span>
    </p>
    <p
      id="date-range-container"
      part="experience-date"
    ></p>
    <div
      class="p-summary mop-wrapper space-bottom"
      part="experience-summary"
    >
      <slot></slot>
    </div>
    <div
      class="p-highlights"
      part="experience-highlights"
    >
      <slot name="highlights"></slot>
    </div>
  </div>
`

const STYLE = `
  :host {
    display: block;
    margin-bottom: 1.5rem;
  }
  .initially-hidden {
    display: none;
  }
  .list-unstyled {
    padding-left: 0;
    list-style: none;
  }
  a {
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  p {
    display: block;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    unicode-bidi: isolate;
  }
`

const ATTRIBUTES = {
  entityName: {
    name: 'data-entity-name' /*    workFor */,
  },
  entityUrl: {
    name: 'data-entity-url' /*     workForUrl */,
  },
  positionTitle: {
    name: 'data-position-title' /* workPosition */,
  },
  /**
   * Items below should be the same as date-range.
   * @TODO Import them and insert here in another task.
   */
  dateBegin: {
    name: 'data-date-begin',
  },
  dateEnd: {
    name: 'data-date-end',
    get default() {
      return getShortFormIso8601Date()
    },
  },
  dateFormat: {
    name: 'data-date-format',
    default: 'YYYY-MM',
  },
  dateLocale: {
    name: 'data-date-locale',
  },
}

export class WorkExperienceElement extends HTMLElement {
  static get observedAttributes() {
    return Object.values(ATTRIBUTES).map(({ name }) => name)
  }

  constructor() {
    super()

    this.attachShadow({ mode: 'open' })
    const styleElement = new CSSStyleSheet()
    styleElement.replaceSync(STYLE)
    this.shadowRoot.adoptedStyleSheets = [styleElement]

    const template = document.createElement('template')
    template.innerHTML = TEMPLATE
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }

  connectedCallback() {
    this.#updateEntityDisplay()
    this.#updatePositionDisplay()
    this.#updateDateRange()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.isConnected) {
      return
    }
    switch (name) {
      case 'data-entity-name':
      case 'data-entity-url': {
        this.#updateEntityDisplay()
        break
      }
      case 'data-position-title': {
        this.#updatePositionDisplay()
        break
      }
      case 'data-date-begin':
      case 'data-date-end':
      case 'data-date-format': {
        this.#updateDateRange()
        break
      }
      default: {
        break
      }
    }
  }

  #updateDateRange() {
    const targetElement = this.shadowRoot.getElementById('date-range-container')
    if (!targetElement) {
      return
    }

    const dateBegin = this.getAttribute('data-date-begin') || ''
    const dateEnd = this.getAttribute('data-date-end')
    const dateFormat = this.getAttribute('data-date-format') || 'YYYY-MM'

    // If we do not have a start date, maybe we do not have anything to use.
    if (dateBegin === '') {
      return
    }

    if (!this._dateRangeElement || !this._dateRangeElement.isConnected) {
      targetElement.innerHTML = ''
      this._dateRangeElement = document.createElement('value-date-range')
      targetElement.appendChild(this._dateRangeElement)
    }

    if (dateBegin) {
      this._dateRangeElement.setAttribute('data-date-begin', dateBegin)
    }

    this._dateRangeElement.setAttribute('data-date-end', dateEnd)
    this._dateRangeElement.setAttribute('data-date-format', dateFormat)
  }

  #updateEntityDisplay() {
    const targetElement = this.shadowRoot.getElementById('entity-display')
    if (!targetElement) {
      return
    }

    const entityName = this.getAttribute('data-entity-name')
    const entityUrl = this.getAttribute('data-entity-url')

    // Clear existing content
    while (targetElement.firstChild) {
      targetElement.removeChild(targetElement.firstChild)
    }

    if (entityUrl && entityName) {
      // Create linked entity name
      try {
        const url = new URL(entityUrl) // Validate URL
        const link = document.createElement('a')
        link.setAttribute('href', url.toString())
        link.setAttribute('target', '_blank')
        link.textContent = entityName
        targetElement.appendChild(link)
      } catch (e) {
        // Invalid URL, fall back to text
        console.warn(`Invalid URL: ${entityUrl}`, e)
        targetElement.textContent = entityName
      }
    } else if (entityName) {
      // Just text for entity name
      targetElement.textContent = entityName
    }
  }

  /**
   * Update the position title display
   */
  #updatePositionDisplay() {
    const targetElement = this.shadowRoot.getElementById('position-display')
    if (!targetElement) {
      return
    }

    const positionTitle = this.getAttribute('data-position-title')

    if (positionTitle) {
      // Add comma after position if there's an entity name
      const hasEntityName = !!this.getAttribute('data-entity-name')
      targetElement.textContent = hasEntityName
        ? `${positionTitle}, `
        : positionTitle
    } else {
      targetElement.textContent = ''
    }
  }
}
