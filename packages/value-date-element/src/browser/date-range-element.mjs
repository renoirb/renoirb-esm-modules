import { STYLE } from './base-element.mjs'
import { calculateDuration } from '../core/index.mjs'

export const VALUE_DATE_RANGE_TEMPLATE = `
  <span id="root">
    <span>
      <span id="date-begin"></span>&hellip;<span id="date-end"></span>
    </span>
    <small>(<smal id="spanning"></span>)</small>
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
    ]
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    const timeEl = document.createElement('time')
    this.shadowRoot.appendChild(timeEl)
    const styleElement = new CSSStyleSheet()
    styleElement.replaceSync(STYLE)
    this.shadowRoot.adoptedStyleSheets = [styleElement]
    const template = document.createElement('template')
    template.innerHTML = VALUE_DATE_RANGE_TEMPLATE
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }

  connectedCallback() {
    this.#updateDuration()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    let mintingElementName = /* BaseValueDateElement */ 'value-date'
    const id = name.replace('data-', '')
    const targetNode = this.shadowRoot.querySelector(`#${id}`)
    if (oldValue !== newValue && this.isConnected) {
      if (
        oldValue !== newValue &&
        typeof newValue !== 'string' &&
        name.startsWith('data-date')
      ) {
        // We do not have a date
        mintingElementName = 'span'
      }
      switch (name) {
        case 'data-date-end':
        case 'data-date-begin': {
          const minted = this.ownerDocument.createElement(mintingElementName)
          minted.setAttribute('id', id)
          if (mintingElementName === 'span') {
            minted.innerText = TEXT_TO_TRANSLATE_TODAY
            // https://www.w3.org/TR/2013/CR-html5-20130806/dom.html#the-translate-attribute
            minted.setAttribute('translate', '')
            minted.setAttribute('data-translate-key', TEXT_TO_TRANSLATE_TODAY)
          } else {
            minted.setAttribute('data-date-format', DATE_FORMAT)
            minted.setAttribute('datetime', newValue)
          }
          targetNode.replaceWith(minted)
          this.#updateDuration()
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
    const durationTargetNode = this.shadowRoot.querySelector('#spanning')
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
    durationTargetNode.textContent = durationTextContent
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
