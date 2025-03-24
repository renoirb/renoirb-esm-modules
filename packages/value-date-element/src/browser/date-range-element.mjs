import { calculateDuration } from '../core.mjs'

export const STYLE = `
  :host {
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
    </span>
    <small id="duration-text"></small>
  </span>
`

const DATE_FORMAT = 'YYYY-MM'

const TEXT_TO_TRANSLATE_TODAY = 'today'

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
      const day = String(today.getDay() + 1).padStart(2, '0')
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
  }

  connectedCallback() {
    for (const [_prop, config] of Object.entries(ATTRIBUTES)) {
      if (!this.hasAttribute(config.name)) {
        if (config.default) {
          this.setAttribute(config.name, config.default)
        }
      }
    }
    const dateFormat = this.getAttribute('data-date-format') ?? DATE_FORMAT
    for (const k of ['date-begin', 'date-end']) {
      const datasetKey = `data-${k}`
      const value = this.getAttribute(datasetKey)
      const targetNode = this.shadowRoot.getElementById(k)
      if (value && targetNode) {
        targetNode.textContent = value
        targetNode.setAttribute('data-date-format', dateFormat)
      }
    }
    this.#updateDuration()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const id = name.replace('data-', '')
    const targetNode = this.shadowRoot.querySelector(`#${id}`)
    if (
      oldValue !== newValue &&
      this.isConnected
    ) {
      const dateFormat = this.getAttribute('data-date-format') ?? DATE_FORMAT
      switch (name) {
        case 'data-date-end':
        case 'data-date-begin': {
          console.assert(targetNode !== null, `Template error missing expected target node`)
          targetNode.setAttribute('data-date-format', dateFormat)
          targetNode.setAttribute('datetime', newValue)
          targetNode.textContent = newValue
          this.#updateDuration()
          break
        }
        case 'data-date-format': {
          this.shadowRoot.getElementById('date-end')?.setAttribute(name, newValue)
          this.shadowRoot.getElementById('date-begin')?.setAttribute(name, newValue)
          break
        }
        case 'data-range-separator': {
          console.assert(targetNode !== null, `Template error missing expected target node`)
          targetNode.textContent = newValue
          break
        }
        default: {
          // nothing
          break
        }
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
    if (this.getAttribute('data-range-hide-duration') !== null) {
      durationTargetNode.textContent = ''
      this.setAttribute('title', durationTextContent)
    } else {
      this.removeAttribute('title')
      durationTargetNode.textContent = '(' + durationTextContent + ')'
    }
    if (!dateEnd) {
      const targetNode = this.shadowRoot.querySelector(`#date-end`)
      const minted = this.ownerDocument.createElement('span')
      minted.innerText = TEXT_TO_TRANSLATE_TODAY
      // https://www.w3.org/TR/2013/CR-html5-20130806/dom.html#the-translate-attribute
      minted.setAttribute('translate', '')
      minted.setAttribute('data-translate-key', TEXT_TO_TRANSLATE_TODAY)
      try {
        targetNode.replaceWith(minted)
      } catch {
        // #TODO When no end date, sometimes it fails, fix later.
      }
    }
  }
}
