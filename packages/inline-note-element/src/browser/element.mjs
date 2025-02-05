import { classNameMap } from '../core/index.mjs'

class InlineNoteElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.debounceDelay = 100 // ms
    this.minDisplayTime = 300 // ms
    this.showTimeout = null
    this.hideTimeout = null
    this.lastShowTime = 0
  }

  connectedCallback() {
    const type = this.getAttribute('type') || 'ins'
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

    let html = `
            <${type} class="px-1 ${bgClass} ${classNameMap.get('rounded')}">
                ${mainContent.innerHTML}
            </${type}>
        `

    if (date || hasComment) {
      html += `
                <span class="relative inline-block ml-1">
                    <span class="${classNameMap.get(
                      'indicator',
                    )} ${indicatorClass}" id="trigger"></span>
                    <div class="${classNameMap.get(
                      'tooltip',
                    )} ${classNameMap.get(
        'tooltipHidden',
      )} left-1/2 transform -translate-x-1/2" style="min-width: 120px; bottom: 100%;" id="tooltip">
                        ${date ? `<div>Date: ${date}</div>` : ''}
                        ${
                          hasComment
                            ? '<div>Comment: <slot name="comment"></slot></div>'
                            : ''
                        }
                    </div>
                </span>
            `
    }

    this.shadowRoot.innerHTML = `
	        <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
            ${html}
        `

    if (date || hasComment) {
      const trigger = this.shadowRoot.getElementById('trigger')
      const tooltip = this.shadowRoot.getElementById('tooltip')

      trigger.addEventListener('mouseenter', () => this.debounceShow(tooltip))
      trigger.addEventListener('mouseleave', () => this.debounceHide(tooltip))
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

export default InlineNoteElement
