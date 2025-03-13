import { calculateDuration } from '../core.mjs'

export const VALUE_DATE_RANGE_ELEMENT_STYLE = `
  :host {
    display: inline;
  }
`

export const VALUE_DATE_RANGE_TEMPLATE = `
  <span id="root">
    <span>
      <value-date id="date-begin"></value-date><span id="range-separator">-</span><value-date id="date-end"></value-date>
    </span>
    <small id="duration-text"></small>
  </span>
`

const DATE_FORMAT = 'YYYY-MM'

const TEXT_TO_TRANSLATE_TODAY = 'today'

export class ValueDateRangeElement extends HTMLElement {
  static get observedAttributes() {
    return [
      /*                    */
      'data-date-begin',
      'data-date-end',
      'data-range-hide-duration',
      'data-range-separator',
      'data-date-format',
    ]
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    const styleElement = new CSSStyleSheet()
    styleElement.replaceSync(VALUE_DATE_RANGE_ELEMENT_STYLE)
    this.shadowRoot.adoptedStyleSheets = [styleElement]
    const template = document.createElement('template')
    template.innerHTML = VALUE_DATE_RANGE_TEMPLATE
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }

  connectedCallback() {
    const dateBegin = this.getAttribute('data-date-begin')
    const dateEnd = this.getAttribute('data-date-end')
    this.shadowRoot.getElementById('date-end').textContent = dateEnd
    this.shadowRoot.getElementById('date-begin').textContent = dateBegin
    this.#updateDuration()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const id = name.replace('data-', '')
    const targetNode = this.shadowRoot.getElementById(id)
    if (
      targetNode &&
      oldValue !== newValue && 
      this.isConnected
    ) {
      const dateFormat = this.getAttribute('data-date-format') ?? DATE_FORMAT
      switch (name) {
        case 'data-date-end':
        case 'data-date-begin': {
          targetNode.setAttribute('data-date-format', dateFormat)
          targetNode.setAttribute('datetime', newValue)
          targetNode.textContent = newValue
          this.#updateDuration()
          break
        }
        case 'data-range-separator': {
          const sep = newValue ?? '..'
          targetNode.textContent = sep
          break
        }
        default: {
          // nothing
          break
        }
      }
    }
  }

  #updateDuration = () => {
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
      this.setAttribute('title', durationTextContent)
      durationTargetNode.textContent = '' 
    } else {
      this.removeAttribute('title')
      durationTargetNode.textContent = '(' + durationTextContent + ')'
    }
    if (!dateEnd) {
      const targetNode = this.shadowRoot.getElementById('date-end')
      targetNode.textContent = TEXT_TO_TRANSLATE_TODAY
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
