import { calculateDuration } from '../core.mjs'
import { currentIndicator } from './current-indicator.mjs'

export const STYLE = `
  :host {
    display: inline;
  }
  #current-indicator-parent {
    display: none;
  }
  /* Show it only when has the is-current flag */
  :host([data-is-current]) #current-indicator-parent {
    display: inline;
  }
`

export const TEMPLATE = `
  <span id="root">
    <span>
      <value-date
        id="date-begin"
        data-date-format="YYYY-MM"
      ></value-date><span
        id="range-separator"
      >-</span><value-date
        id="date-end"
        data-date-format="YYYY-MM"
      ></value-date>
      <span id="current-indicator-parent">
        <slot name="current-indicator">${currentIndicator()}</slot>
      </span>
    </span>
    <small id="duration-text"></small>
  </span>
`

const DATE_FORMAT = 'YYYY-MM'

const ATTRIBUTES = {
  dateBegin: {
    name: 'data-date-begin',
  },
  dateEnd: {
    name: 'data-date-end',
    get default() {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate() + 1).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
  },
  dateFormat: {
    name: 'data-date-format',
    default: DATE_FORMAT,
  },
  rangeHideDuration: {
    name: 'data-range-hide-duration',
    default: false,
  },
  rangeSeparator: {
    name: 'data-range-separator',
    default: '—',
  },
}

export class ValueDateRangeElement extends HTMLElement {
  static get observedAttributes() {
    return Object.values(ATTRIBUTES).map(({ name }) => name)
  }

  #initialized = false

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
    // Set default attributes
    for (const [_prop, config] of Object.entries(ATTRIBUTES)) {
      if (!this.hasAttribute(config.name) && config.default) {
        this.setAttribute(config.name, config.default)
      }
    }

    // Initialize child date elements
    this.#initializeDateElements()
    this.#initialized = true

    // Calculate and show duration
    this.#updateDuration()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.#initialized) {
      return
    }

    switch (name) {
      case 'data-date-begin': {
        const dateFormat =
          this.getAttribute('data-date-format') ?? ATTRIBUTES.dateFormat.default
        const el = this.shadowRoot.getElementById('date-begin')
        if (el) {
          el.setAttribute('data-date', newValue || '')
          el.setAttribute('data-date-format', dateFormat)
        }
        this.#updateDuration()
        break
      }

      case 'data-date-end': {
        this.#setDateEnd(newValue)
        this.#updateDuration()
        break
      }

      case 'data-range-hide-duration': {
        this.#updateDuration()
        break
      }

      case 'data-date-format': {
        // Update format on both date elements
        const format = newValue || ATTRIBUTES.dateFormat.default
        this.shadowRoot
          .getElementById('date-begin')
          ?.setAttribute('data-date-format', format)
        this.shadowRoot
          .getElementById('date-end')
          ?.setAttribute('data-date-format', format)
        break
      }

      case 'data-range-separator': {
        const el = this.shadowRoot.getElementById('range-separator')
        if (el) {
          el.textContent = newValue
        }
        break
      }
    }
  }

  #initializeDateElements() {
    const dateFormat =
      this.getAttribute('data-date-format') ?? ATTRIBUTES.dateFormat.default
    const beginEl = this.shadowRoot.getElementById('date-begin')
    const separatorEl = this.shadowRoot.getElementById('range-separator')
    const dateEnd = this.getAttribute('data-date-end')

    // Set separator text
    if (separatorEl) {
      separatorEl.textContent =
        this.getAttribute('data-range-separator') ||
        ATTRIBUTES.rangeSeparator.default
    }

    // Initialize begin date
    if (beginEl) {
      const dateBegin = this.getAttribute('data-date-begin')
      if (dateBegin) {
        beginEl.setAttribute('data-date', dateBegin)
        beginEl.setAttribute('data-date-format', dateFormat)
      }
    }

    // Initialize end date
    this.#setDateEnd(dateEnd)
  }

  #setDateEnd(value) {
    const dateFormat =
      this.getAttribute('data-date-format') ?? ATTRIBUTES.dateFormat.default

    // Check for all possible "empty" values
    const isCurrent =
      !value || value === ATTRIBUTES.dateEnd.default || value === 'null'

    const el = this.shadowRoot.getElementById('date-end')
    if (el) {
      el.setAttribute('data-date-format', dateFormat)

      // Set the actual date
      const dateValue = isCurrent ? ATTRIBUTES.dateEnd.default : value
      el.setAttribute('data-date', dateValue)

      // Add data-is-current attribute for styling if needed
      if (isCurrent) {
        el.setAttribute('data-is-current', '')
        this.setAttribute('data-is-current', '')
      } else {
        el.removeAttribute('data-is-current')
        this.removeAttribute('data-is-current')
      }

      if (this.getAttribute('data-debug')) {
        console.info(`${this.constructor.name}.#setDateEnd(${value})`, {
          isCurrent,
          defaultValue: ATTRIBUTES.dateEnd.default,
          dateValue,
          el,
        })
      }
    } else {
      if (this.getAttribute('data-debug')) {
        console.info(`${this.constructor.name}.#setDateEnd(${value})`, {
          isCurrent,
          defaultValue: ATTRIBUTES.dateEnd.default,
          el,
        })
      }
    }
  }

  #updateDuration() {
    const dateBegin = this.getAttribute('data-date-begin')
    const dateEnd = this.getAttribute('data-date-end')
    const durationTargetNode = this.shadowRoot.getElementById('duration-text')
    let durationTextContent = ''

    try {
      const calculated = calculateDuration(dateBegin, dateEnd)
      const { years = 0, months = 0 } = calculated
      durationTextContent = Object.entries({ years: years ?? 0, months })
        .map(([label, value]) => (value > 0 ? `${value} ${label}` : null))
        .filter((i) => i !== null) //                    ^^^^^^^^
        .join(', ') //                                          |
      // #TODO: Yeah, OK, j’ai mis ma charrue devant les boeufs | avec translate
    } catch {
      durationTextContent = ''
    }

    // Update duration display based on hide-duration flag
    if (this.hasAttribute('data-range-hide-duration')) {
      durationTargetNode.textContent = ''
      this.setAttribute('title', durationTextContent)
    } else {
      this.removeAttribute('title')
      durationTargetNode.textContent = durationTextContent
        ? `(${durationTextContent})`
        : ''
    }
  }
}
