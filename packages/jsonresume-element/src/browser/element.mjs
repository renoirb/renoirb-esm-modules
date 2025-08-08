import { ContextRequestEvent } from '@renoirb/context-api'
import {
  /*                    */
  assertIsContextRequestJsonResumeBasics,
  stringifyBasicsLocation,
 } from '@renoirb/jsonresume-utils'
import {
  /*                    */
  ContextRequest_JsonResume_Basics,
} from './context-api.mjs'

const TEMPLATE = `
  <article id="resume">
    <header
      id="basics"
      part="basics"
    >
    </header>
    <section
      id="work"
      part="work"
      class="no-contents"
    >
      <h2 class="section-title">Work Experience</h2>
      <div class="section-content">
        <slot name="work-experience"></slot>
      </div>
      </div>
    </section>
    <section
      id="education"
      part="education"
      class="no-contents"
    >
      <h2 class="section-title">Education</h2>
      <div class="section-content">
        <slot name="education"></slot>
      </div>
    </section>
  </article>
`

const STYLE = `
  :host {
    display: block;
    margin-bottom: 1.5rem;
  }
  .no-contents {
    display: none;
  }
  #resume {
    /* stub */
  }
`

export class JsonResumeElement extends HTMLElement {
  #unsubscribe = null;

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    const styleElement = new CSSStyleSheet()
    styleElement.replaceSync(STYLE)
    this.shadowRoot.adoptedStyleSheets = [styleElement]
    const template = document.createElement('template')
    template.innerHTML = TEMPLATE
    this.shadowRoot.appendChild(template.content.cloneNode(true))
    this.shadowRoot.addEventListener('slotchange', this.#slotChangeCallback)
  }

  connectedCallback() {
    this.dispatchEvent(
      new ContextRequestEvent(
        ContextRequest_JsonResume_Basics,
        this,
        this.#onContextEventJsonResumeBasics,
        true,
      ),
    )
  }

  #slotChangeCallback = (event) => {
    const slot = event.target
    if (!(slot instanceof HTMLSlotElement)) {
      return
    }
    const assignedNodes = slot.assignedNodes()
    if (assignedNodes.length === 0) {
      return
    }
    const parentParentElement = slot.parentElement?.parentElement
    parentParentElement.classList.remove('no-contents')
  }

  #onContextEventJsonResumeBasics = (basics) => {
    this.renderBasics(basics)
  }

  renderBasics(basics) {
    assertIsContextRequestJsonResumeBasics(basics)
    const {
      name = 'Renoir Boulanger',
      label,
      // image,
      email,
      phone,
      url,
      summary,
      // profiles = [],
    } /*: JSONResumeSchema['basics']*/ = basics || {}
    const stringifiedLocation = stringifyBasicsLocation(basics)

    const template = this.ownerDocument.createElement('div')
    template.classList.add('section-content')
    template.innerHTML = `
      <h1>${name}</h1>
      ${label ? `<h2>${label}</h2>` : ''}
      ${summary ? `<p>${summary}</p>` : ''}
      <dl class="contact-info">
        ${
          stringifiedLocation !== ''
            ? `<dt>Location</dt><dd>${stringifiedLocation}</dd>`
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
