/**
 * The following is scavenged markup from JSONResume Registry for now
 * https://registry.jsonresume.org/renoirb
 */
const TEMPLATE = `
  <div class="p-experience">
    <p class="clear-margin relative">
      <strong id="workPosition"></strong>,&nbsp;<a target="_blank" id="workFor"></a>
    </p>
    <p class="text-muted">
      <small>
        <span class="space-right">
          <time id="dateStart" datetime></time>&nbsp;-&nbsp;
          <time id="dateEnd" datetime></time>
        </span>
        <span id="duration" class="initially-hidden">
          <time datetime></time>
        </span>
      </small>
    </p>
    <div class="p-summary mop-wrapper space-bottom">
      <slot></slot>
    </div>
    <div class="p-highlights">
      <slot name="highlights"></slot>
    </div>
    </ul>
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

const ATTRIBUTES = new Set([
  /*                 */
  'workFor',
  'workForUrl',
  'workPosition',
  'dateEnd',
  'dateStart',
])

const DEFAULT_WORK_EXPERIENCE_DATE_ELEMENT = 'work-experience-date'
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
    return [...ATTRIBUTES]
  }

  static setDateComponentTagName(variant) {
    changeOnlyOnce(variant)
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
    ;[...ATTRIBUTES].forEach((attributeName) => {
      this.#updateAttribute(attributeName)
    })
  }

  #updateAttribute = (attributeName) => {
    if (!ATTRIBUTES.has(attributeName)) {
      const supported = [...ATTRIBUTES].join(', ')
      const message = `Unsupported attribute "${attributeName}", can only be one of [${supported}]`
      throw new Error(message)
    }
    switch (attributeName) {
      case 'workFor':
        const workFor = this.getAttribute('workFor')
        this.shadowRoot.getElementById('workFor').innerText = workFor
        break

      case 'workForUrl':
        const workForUrl = this.getAttribute('workForUrl')
        this.shadowRoot
          .getElementById('workFor')
          .setAttribute('href', workForUrl)
        break

      case 'workPosition':
        const workPosition = this.getAttribute('workPosition')
        this.shadowRoot.getElementById('workPosition').innerText = workPosition
        break

      case 'dateEnd':
      case 'dateStart':
        const attributeValue = this.getAttribute(attributeName)
        if (attributeValue) {
          const initialDateElement =
            this.shadowRoot.getElementById(attributeName)
          initialDateElement.setAttribute('datetime', attributeValue)
          const replacingWith = document.createElement(
            WORK_EXPERIENCE_DATE_ELEMENT,
          )
          replacingWith.setAttribute('datetime', attributeValue)
          replacingWith.dataset.dateFormat = 'YYYY-MM'
          initialDateElement.replaceWith(replacingWith)
        }
        break
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (ATTRIBUTES.has(name) && oldValue !== newValue) {
      this.shadowRoot.getElementById(name).innerText = newValue
    }
  }
}
