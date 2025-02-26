/**
 * The following is scavenged markup from JSONResume Registry for now
 * https://registry.jsonresume.org/renoirb
 */
const VALUE_WORK_EXPERIENCE_TEMPLATE = `
  <div class="p-experience">
    <p class="clear-margin relative">
      <strong id="workPosition"></strong>,&nbsp;<a target="_blank" id="workFor"></a>
    </p>
    <p class="text-muted" id="dateRange"></p>
    <div class="p-summary mop-wrapper space-bottom">
      <slot></slot>
    </div>
    <div class="p-highlights">
      <slot name="highlights"></slot>
    </div>
    </ul>
  </div>
`

const VALUE_WORK_EXPERIENCE_STYLE = `
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

/**
 * Transform string from "fooBarBaz" (camelCase) into "foo-bar-baz" (kebab-case)
 */
const camelCaseToKebab = (str) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())

const ATTRIBUTES = new Map([
  /*                 */
  'workFor',
  'workForUrl',
  'workPosition',
  'dateBegin',
  'dateEnd',
].map(i => ([i, `data-${camelCaseToKebab(i)}`])))


const DEFAULT_WORK_EXPERIENCE_DATE_ELEMENT = 'value-date-range'
let WORK_EXPERIENCE_DATE_ELEMENT = DEFAULT_WORK_EXPERIENCE_DATE_ELEMENT

const changeOnlyOnce = (candidate) => {
  if (WORK_EXPERIENCE_DATE_ELEMENT === DEFAULT_WORK_EXPERIENCE_DATE_ELEMENT) {
    WORK_EXPERIENCE_DATE_ELEMENT = candidate
  } else if (
    WORK_EXPERIENCE_DATE_ELEMENT !== DEFAULT_WORK_EXPERIENCE_DATE_ELEMENT
  ) {
    const message = `Cannot set to "${candidate}" it is already set to ${WORK_EXPERIENCE_DATE_ELEMENT}.`
    throw new Error(message)
  }
}

export class WorkExperienceElement extends HTMLElement {
  static get observedAttributes() {
    return [...ATTRIBUTES.keys()]
  }

  static setDateComponentTagName(variant) {
    changeOnlyOnce(variant)
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    const styleElement = new CSSStyleSheet()
    styleElement.replaceSync(VALUE_WORK_EXPERIENCE_STYLE)
    this.shadowRoot.adoptedStyleSheets = [styleElement]

    const template = document.createElement('template')
    template.innerHTML = VALUE_WORK_EXPERIENCE_TEMPLATE
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }

  connectedCallback() {
    ;[...ATTRIBUTES.keys()].forEach((attributeName) => {
      this.#updateAttribute(attributeName)
    })
  }


  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      this.#updateAttribute(name)
    }
  }

  #updateDateRange = (dateBegin, dateEnd) => {
    if (typeof dateBegin === 'string') {
      console.log('#updateDateRange', {dateBegin, dateEnd})
      const wherever = this.shadowRoot.getElementById('dateRange')
      wherever.innerHTML = ''
      const minted = this.ownerDocument.createElement(WORK_EXPERIENCE_DATE_ELEMENT)
      minted.setAttribute('data-date-begin', dateBegin)
      if (dateEnd) {
        minted.setAttribute('data-date-end', dateEnd)
      }
      minted.setAttribute('data-date-format', 'YYYY-MM')
      wherever.appendChild(minted)
    }
  }

  #updateAttribute = (attributeName) => {
    if (!ATTRIBUTES.has(attributeName)) {
      const supported = [...ATTRIBUTES.keys()].join(', ')
      const message = `Unsupported attribute "${attributeName}", can only be one of [${supported}]`
      throw new Error(message)
    }
    switch (attributeName) {
      case 'workFor': {
        const workFor = this.getAttribute('workFor')
        this.shadowRoot.getElementById('workFor').innerText = workFor
        break
      }
      case 'workForUrl': {
        const workForUrl = this.getAttribute('workForUrl')
        this.shadowRoot
          .getElementById('workFor')
          .setAttribute('href', workForUrl)
        break
      }
      case 'workPosition': {
        const workPosition = this.getAttribute('workPosition')
        this.shadowRoot.getElementById('workPosition').innerText = workPosition
        break
      }
      case 'dateEnd':
      case 'dateBegin': {
        const dateBegin = this.getAttribute('dateBegin')
        const dateEnd = this.getAttribute('dateEnd')
        this.#updateDateRange(dateBegin, dateEnd)
        break
      }
    }
  }
}
