import { calculateDuration } from '../core.mjs'

export const STYLE = `
  :host {
    display: inline;
  }
  #date-end[data-is-current]::after {
    content: ' (current)';
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
    get default () {
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

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    const styleElement = new CSSStyleSheet()
    styleElement.replaceSync(STYLE)
    this.shadowRoot.adoptedStyleSheets = [styleElement]
    const template = document.createElement('template')
    template.innerHTML = TEMPLATE
    this.shadowRoot.appendChild(template.content.cloneNode(true))

    // Track initialization state
    this._initialized = false
  }

  connectedCallback() {
    // Set default attributes
    for (const [_prop, config] of Object.entries(ATTRIBUTES)) {
      if (!this.hasAttribute(config.name) && config.default) {
        this.setAttribute(config.name, config.default)
      }
    }

    // Initialize child date elements
    this._initializeDateElements()
    this._initialized = true

    // Calculate and show duration
    this.#updateDuration()
  }


  #setDateEnd(value) {
    const dateFormat = this.getAttribute('data-date-format') ?? ATTRIBUTES.dateFormat.default
    const isDefaultValue = value === ATTRIBUTES.dateEnd.default
    const el = this.shadowRoot.getElementById('date-end')
    if (el) {
      el.setAttribute('data-date-format', dateFormat)
      if (!isDefaultValue) {
        el.setAttribute('data-date', value)
        el.removeAttribute('data-is-current')
      } else {
        // Current date - mark as current rather than replacing
        const currentDate = ATTRIBUTES.dateEnd.default
        el.setAttribute('data-date', currentDate)
        el.setAttribute('data-is-current', ' ') // Special flag for styling
      }
    }
    if (this.getAttribute('data-debug')) {
      console.error(`ValueDateRangeElement.#setDateEnd(${value})`, { el, isDefaultValue, value, defaultValue: ATTRIBUTES.dateEnd.default })
    }
  }

  _initializeDateElements() {
    const dateFormat = this.getAttribute('data-date-format') ?? ATTRIBUTES.dateFormat.default
    const beginEl = this.shadowRoot.getElementById('date-begin')
    const endEl = this.shadowRoot.getElementById('date-end')
    const separatorEl = this.shadowRoot.getElementById('range-separator')

    const dateBegin = this.getAttribute('data-date-begin')
    const dateEnd = this.getAttribute('data-date-end')

    if (this.getAttribute('data-debug')) {
      console.log('ValueDateRangeElement _initializeDateElements 0', { dateBegin, dateEnd })
      console.log('ValueDateRangeElement _initializeDateElements 0 beginEl', beginEl)
      console.log('ValueDateRangeElement _initializeDateElements 0 endEl', endEl)
    }

    // Set separator text
    if (separatorEl) {
      separatorEl.textContent = this.getAttribute('data-range-separator') ||
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

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._initialized) {
      return
    }

    const dateFormat = this.getAttribute('data-date-format') ?? ATTRIBUTES.dateFormat.default

    if (this.getAttribute('data-debug')) {
      console.error(`ValueDateRangeElement.attributeChangedCallback(${name}, ${oldValue}, ${newValue})`)
    }

    switch (name) {
      case 'data-date-begin': {
        const el = this.shadowRoot.getElementById('date-begin')
        if (el) {
          el.setAttribute('data-date', newValue || '')
          el.setAttribute('data-date-format', dateFormat)
        }
        this.#updateDuration()
        break
      }

      case 'data-date-end': {
        const el = this.shadowRoot.getElementById('date-end')
        if (el) {
          // This is useless to check if there is a newValue or Not, it has been setup in _initializeDateElements
          // And it has been set at that time, and will not be changed here since we've already set a default.
          const isDefault = newValue === ATTRIBUTES.dateEnd.default
          console.error('ValueDateRangeElement.attributeChangedCallback.data-date-end', { newValue, default: ATTRIBUTES.dateEnd.default, isDefault })
          if (newValue) {
            el.setAttribute('data-date', newValue)
            el.removeAttribute('data-is-current')
          } else {
            // Current date
            const currentDate = ATTRIBUTES.dateEnd.default
            el.setAttribute('data-date', currentDate)
            el.setAttribute('data-is-current', '')
            el.textContent = 'current'
          }
          el.setAttribute('data-date-format', dateFormat)
        }
        this.#updateDuration()
        break
      }

      case 'data-date-format': {
        // Update format on both date elements
        const beginEl = this.shadowRoot.getElementById('date-begin')
        const endEl = this.shadowRoot.getElementById('date-end')

        if (beginEl) {
          beginEl.setAttribute('data-date-format', newValue)
        }
        if (endEl) {
          endEl.setAttribute('data-date-format', newValue)
        }
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
      durationTargetNode.textContent = durationTextContent ?
        `(${durationTextContent})` : ''
    }
  }
}
