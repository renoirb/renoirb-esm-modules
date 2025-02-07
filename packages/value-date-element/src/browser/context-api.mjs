export const ContextRequest_DateConversion = 'date-conversion'

export const bindContextResponseHandlerMethodForDateContext = (element) => {
  // Expecting to find a shadowRoot, that finds only one time element
  const errorMessageSuffix = `
    The purpose is to help update the date from within a CustomElement and we are expecting
    to have a shadowRoot with at most one time element.
  `
  if (!element.shadowRoot) {
    const message = `No shadowRoot found! ${errorMessageSuffix}`
    throw new Error(message)
  }

  const timeEl = element.shadowRoot.querySelector('time')
  if (!timeEl) {
    const message = `No time element found! ${errorMessageSuffix}`
    throw new Error(message)
  }

  const datetime = element.getAttribute('datetime')
  if (!datetime) {
    const message = `The host implementation MUST have a datetime attribute. ${errorMessageSuffix}`
    throw new Error(message)
  }

  /**
   * @param {import('../core/types.ts').DateContextPayload} data
   */
  const handleDateContextResponse = (contextResponse) => {
    const { human, isoString, unixEpoch } = contextResponse
    if (isoString) {
      timeEl.setAttribute('datetime', isoString)
    }
    if (human) {
      timeEl.textContent = human
    }
    if (unixEpoch) {
      timeEl.setAttribute('data-unix-epoch', unixEpoch)
    }
  }
  return handleDateContextResponse
}
