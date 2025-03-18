const TEMPLATE = `
  <article id="resume">
    <header id="basics"></header>
    <section id="work">
      <h2>Work Experience</h2>
      <slot name="work-experience"></slot>
    </section>
    <section id="education">
      <h2>Education</h2>
      <slot name="education"></slot>
    </section>
  </article>
`

const STYLE = `
  :host {
    display: block;
    margin-bottom: 1.5rem;
  }
  #resume {
    /* stub */
  }
`

const camelCaseToKebab = (str) =>
  str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? '-' : '') + $.toLowerCase(),
  )

const ATTRIBUTES = new Map(
  [
    /*                 */
  ].map((i) => [i, `data-${camelCaseToKebab(i)}`]),
)

export class JsonResumeParentElement extends HTMLElement {
  static get observedAttributes() {
    return [...ATTRIBUTES.keys()]
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
    ;[...ATTRIBUTES.keys()].forEach((attributeName) => {
      this.#updateAttribute(attributeName)
    })
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) {
      this.#updateAttribute(name)
    }
  }

  #updateAttribute = (_attributeName) => {}

  renderBasics(
    {
      name = 'Renoir Boulanger',
      label,
      // image,
      email,
      phone,
      url,
      summary,
      location,
      // profiles = [],
    } /*: JSONResumeSchema['basics']*/,
  ) {
    const {
      // address,
      // postalCode,
      city,
      countryCode,
      region,
    } = location || {}
    const stringifiedLocation = [city, region, countryCode].filter(Boolean)

    const template = this.ownerDocument.createElement('div')
    template.innerHTML = `
      <h1>${name}</h1>
      ${label ? `<h2>${label}</h2>` : ''}
      ${summary ? `<p>${summary}</p>` : ''}
      <dl class="contact-info">
        ${
          stringifiedLocation.length > 0
            ? `<dt>Location</dt><dd>${stringifiedLocation.join(', ')}</dd>`
            : ''
        }
        ${email ? `<dt>Email</dt><dd>${email}</dd>` : ''}
        ${phone ? `<dt>Phone</dt><dd>${phone}</dd>` : ''}
        ${url ? `<dt>Website</dt><dd><a href="${url}">${url}</a></dd>` : ''}
      </dl>
    `
    const targetElement = this.shadowRoot.getElementById('basics')
    targetElement.appendChild(template)
  }
}
