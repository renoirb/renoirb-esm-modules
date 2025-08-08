import { classNameMap } from '../core.mjs'

//
// See also: https://gist.github.com/renoirb/7e06321cfee47263a12838c17d32e981
//

export const TEMPLATE = `
  <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
  <span id="content-container"></span>
  <span class="relative inline-block ml-1" id="tooltip-container" style="display:none">
    <span id="trigger"></span>
    <div
      id="tooltip"
      class="left-1/2 transform -translate-x-1/2"
      style="min-width: 120px; bottom: 100%;"
    >
      <div id="date-container"></div>
      <div id="comment-container">
        Comment: <slot name="comment"></slot>
      </div>
    </div>
  </span>
`

const ATTRIBUTES = {
  /**
   * @TODO Make this a data-type attribute instead of using the global type attribute
   */
  type: {
    name: 'type',
    values: ['ins', 'del'],
    default: 'ins',
  },
  /**
   * @TODO Make this use a data-* attribute, we could use same date-conversion Context API data shape as value-date-element and pass other formatting logic such as data-date-format
   */
  date: {
    name: 'date',
  },
}

export class InlineNoteElement extends HTMLElement {
  static get observedAttributes() {
    return Object.values(ATTRIBUTES).map(({ name }) => name)
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })

    this.debounceDelay = 100 // ms
    this.minDisplayTime = 300 // ms
    this.showTimeout = null
    this.hideTimeout = null
    this.lastShowTime = 0

    // Set up the initial DOM structure once
    const template = document.createElement('template')
    template.innerHTML = TEMPLATE
    this.shadowRoot.appendChild(template.content.cloneNode(true))

    // Set up listeners ONCE for the lifetime of the component
    const trigger = this.shadowRoot.getElementById('trigger')
    const tooltip = this.shadowRoot.getElementById('tooltip')
    if (trigger && tooltip) {
      trigger.addEventListener('mouseenter', () => this.debounceShow(tooltip))
      trigger.addEventListener('mouseleave', () => this.debounceHide(tooltip))
    }
  }


  connectedCallback() {
    this.#renderContent()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return
    }
    const attrConfig = Object.values(ATTRIBUTES).find((a) => a.name === name)
    if (!attrConfig) {
      return
    }
    this.#renderContent()
  }

  #renderContent() {
    const type = this.getAttribute('type') || ATTRIBUTES.type.default
    const date = this.getAttribute('date')
    const hasComment = this.querySelector('[slot="comment"]')

    const mainContent = document.createElement('span')
    mainContent.innerHTML = this.innerHTML
    const commentSlot = mainContent.querySelector('[slot="comment"]')
    if (commentSlot) {
      mainContent.removeChild(commentSlot)
    }

    const bgClass =
      type === 'ins'
        ? classNameMap.get('insertBg')
        : classNameMap.get('deleteBg')
    const indicatorClass =
      type === 'ins'
        ? classNameMap.get('insertIndicator')
        : classNameMap.get('deleteIndicator')

    // Update the content container
    const contentContainer = this.shadowRoot.getElementById('content-container')
    contentContainer.innerHTML = `
      <${type} class="px-1 ${bgClass} ${classNameMap.get('rounded')}">
        ${mainContent.innerHTML}
      </${type}>
    `

    // Update indicator class
    const triggerEl = this.shadowRoot.getElementById('trigger')
    if (triggerEl) {
      triggerEl.className = `${classNameMap.get('indicator')} ${indicatorClass}`
    }

    const tooltipEl = this.shadowRoot.getElementById('tooltip')
    if (tooltipEl) {
      tooltipEl.className = `${classNameMap.get('tooltip')} ${classNameMap.get('tooltipHidden')} left-1/2 transform -translate-x-1/2`
    }

    // Update date container if needed
    const dateContainer = this.shadowRoot.getElementById('date-container')
    if (dateContainer) {
      if (date) {
        dateContainer.innerHTML = `Date: <value-date data-date-format="YYYY-MM-DD" datetime="${date}">${date}</value-date>`
        dateContainer.style.display = 'block'
      } else {
        dateContainer.innerHTML = ''
        dateContainer.style.display = 'none'
      }
    }

    // Update comment container visibility
    const commentContainer = this.shadowRoot.getElementById('comment-container')
    if (commentContainer) {
      commentContainer.style.display = hasComment ? 'block' : 'none'
    }

    // Show/hide tooltip container
    const tooltipContainer = this.shadowRoot.getElementById('tooltip-container')
    if (tooltipContainer) {
      tooltipContainer.style.display = (date || hasComment) ? 'inline-block' : 'none'
    }
  }

  debounceShow(tooltip) {
    clearTimeout(this.hideTimeout)
    clearTimeout(this.showTimeout)

    this.showTimeout = setTimeout(() => {
      this.showTooltip(tooltip)
    }, this.debounceDelay)
  }

  debounceHide(tooltip) {
    clearTimeout(this.showTimeout)
    clearTimeout(this.hideTimeout)

    const timeShown = Date.now() - this.lastShowTime
    const remainingTime = Math.max(0, this.minDisplayTime - timeShown)

    this.hideTimeout = setTimeout(() => {
      this.hideTooltip(tooltip)
    }, remainingTime)
  }

  showTooltip(tooltip) {
    tooltip.classList.remove(...classNameMap.get('tooltipHidden').split(' '))
    tooltip.classList.add(...classNameMap.get('tooltipVisible').split(' '))
    this.lastShowTime = Date.now()
  }

  hideTooltip(tooltip) {
    tooltip.classList.remove(...classNameMap.get('tooltipVisible').split(' '))
    tooltip.classList.add(...classNameMap.get('tooltipHidden').split(' '))
  }
}

