/**
 * Sometimes you might want to ignore empty text nodes
 *
 * @param {*} slot
 * @returns
 */
export const ignoreEmptyTextNodes = (slot) =>
  slot
    .assignedNodes()
    .some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE ||
        (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ''),
    )

/**
 *
 */
export const CSS_HIDE_EMPTY_SLOTS = `
  .wrapper:has(slot:not(:empty)) {
    display: block;
  }

  .wrapper:has(slot:empty) {
    display: none;
  }
`

export const WithConditionalSlot = (Base) => {
  return class extends Base {
    constructor() {
      super()
      this.attachShadow({ mode: 'open' })
      // Create shadow DOM...

      // Bind methods once
      this._handleSlotChange = this._handleSlotChange.bind(this)
    }

    connectedCallback() {
      // Use event delegation on shadowRoot
      this.shadowRoot.addEventListener('slotchange', this._handleSlotChange)

      // Initial check for all slots
      this._updateAllSlotWrappers()
    }

    disconnectedCallback() {
      this.shadowRoot.removeEventListener('slotchange', this._handleSlotChange)
    }

    _handleSlotChange(event) {
      // The slot that changed
      const slot = event.target
      const slotName = slot.name

      // Update the specific wrapper
      this._updateSlotWrapper(slotName)
    }

    _updateSlotWrapper(slotName) {
      const slot = this.shadowRoot.querySelector(`slot[name="${slotName}"]`)
      if (!slot) return

      const wrapper = slot.parentElement
      if (!wrapper) return

      wrapper.style.display = slot.assignedNodes().length > 0 ? '' : 'none'
    }

    _updateAllSlotWrappers() {
      // Get all named slots
      const slots = this.shadowRoot.querySelectorAll('slot[name]')
      slots.forEach((slot) => {
        this._updateSlotWrapper(slot.name)
      })
    }
  }
}
