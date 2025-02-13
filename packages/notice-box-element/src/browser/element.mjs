import { createVariantManager, styleMap, assertValidVariant } from '../core/index.mjs'

const STYLE = `
  :host {
    display: block;

    /** TODO Make configurable **/
    --color-sandwich-bg: #000;
    --color-sandwich-left-splat-bg: #bdbdbd;
    --color-sandwich-text: #fff;
    --color-container: #f9f9f9;
    --color-backdrop: #e5e5e5;
    --bg: var(--color-backdrop);
    --color: #577f79;
    --color-title: #262626;
    --color-subtitle: #999;
    --color-primary: #214761;
    --color-secondary: #bb3f3f;
    --color-tertiary: #cb7723;
    --bg-secondary: #e5e5e5;
    --border-color: #aaa;
    --color-taxonomy-bg: #bdbdbd;
    --color-taxonomy-bg-hover: #959595;
    --color-taxonomy-text-hover: #fff;
    --color-taxonomy-text: #fff;
    --color-container-text-link: var(--color-primary);
    --color-container-text-link-hover: var(--color-secondary);
  }

  .hidden {
    display: none !important;
  }

  .disposition-parent {
    padding: .75rem 1rem;
    border-radius: .5rem;
  }
  .disposition-parent header {
    font-weight: 700;
    margin-bottom: .5rem;
  }

  /** ---- BEGIN ---- Dirty scavenging from TailwindCSS ---- */
  .text-yellow-800 {
    --text-opacity: 1;
    color: #975a16;
    color: rgba(151,90,22,var(--text-opacity));
  }
  .border-yellow-400 {
    --border-opacity: 1;
    border-color: #f6e05e;
    border-color: rgba(246,224,94,var(--border-opacity));
  }
  .bg-yellow-200 {
    --bg-opacity: 1;
    background-color: #fefcbf;
    background-color: rgba(254,252,191,var(--bg-opacity));
  }
  text-blue-800 {
    --text-opacity: 1;
    color: #2c5282;
    color: rgba(44,82,130,var(--text-opacity));
  }
  .text-yellow-800 {
    --text-opacity: 1;
    color: #975a16;
    color: rgba(151,90,22,var(--text-opacity));
  }
  .border-blue-400 {
    --border-opacity: 1;
    border-color: #63b3ed;
    border-color: rgba(99,179,237,var(--border-opacity));
  }
  .bg-blue-200 {
    --bg-opacity: 1;
    background-color: #bee3f8;
    background-color: rgba(190,227,248,var(--bg-opacity));
  }
  .border-red-400 {
    --border-opacity: 1;
    border-color: #fc8181;
    border-color: rgba(252,129,129,var(--border-opacity));
  }
  .bg-red-200 {
    --bg-opacity: 1;
    background-color: #fed7d7;
    background-color: rgba(254,215,215,var(--bg-opacity));
  }
  /** ----  END  ---- Dirty scavenging from TailwindCSS ---- */`

const TEMPLATE = `<div
  class="disposition-parent"
  data-alert-type="warn"
  role="alert"
>
  <header class="disposition-item" part="slot-parent-header">
    <!-- Do not keep parent in the DOM tree when empty -->
    <slot name="header"></slot>
  </header>
  <div class="disposition-item">
    <!-- TODO: see https://github.com/renoirb/site/blob/2020/lib/runtime/tailwind/alert.ts make as WC -->
    <slot></slot>
  </div>
</div>
`

const variantManager = createVariantManager()

export class NoticeBoxElement extends HTMLElement {
  static get observedAttributes() {
    return ['variant']
  }

  static setDefaultVariant(variant) {
    variantManager.setDefaultVariant(variant)
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    const templateElement = document.createElement('template')
    templateElement.innerHTML = TEMPLATE
    this.shadowRoot.appendChild(templateElement.content.cloneNode(true))
    const styleElement = new CSSStyleSheet()
    styleElement.replaceSync(STYLE)
    this.shadowRoot.adoptedStyleSheets = [styleElement]
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'variant' && oldValue !== newValue) {
      this.#updateVariant(newValue)
    }
  }

  connectedCallback() {
    let variant = this.getAttribute('variant')
    if (!variant) {
      variant = variantManager.getDefaultVariant()
    }
    this.#updateVariant(variant)
    this.#handleHeaderTextContent()
  }

  #updateVariant(variant = variantManager.getDefaultVariant()) {
    assertValidVariant(variant)
    this.#setDataType(variant)
    // console.log(`${this.constructor.name}.#updateVariant`, { variant })
    const { outer, heading } = styleMap(variant)
    const targetOuter = this.shadowRoot.querySelector('.disposition-parent')
    const targetBody = this.shadowRoot.querySelector(
      '.disposition-parent > div.disposition-item',
    )
    for (const className of targetBody.classList) {
      if (className !== 'disposition-item') {
        targetOuter.classList.remove(className)
      }
    }
    for (const className of targetOuter.classList) {
      if (className !== 'disposition-parent') {
        targetOuter.classList.remove(className)
      }
    }
    for (const className of outer) {
      targetOuter.classList.add(className)
    }
    for (const className of heading) {
      targetBody.classList.add(className)
    }
  }

  #setDataType(alertType) {
    const target = this.shadowRoot.querySelector('[data-alert-type]')
    if (target) {
      target.dataset.alertType = alertType
    }
  }

  #handleHeaderTextContent() {
    const target = this.querySelector('[slot="header"]')
    const headerElement = this.shadowRoot.querySelector('header')
    if (!target) {
      headerElement.classList.add('hidden')
    } else {
      headerElement.classList.remove('hidden')
    }
  }
}
