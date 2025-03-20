export const ContextRequest_DateConversion = 'date-conversion'

/**
 * @param {import('./types.ts').DateConversionContextPayload} data
 */
export const isDateConversionContextPayload = (data) => {
  return (
    data &&
    typeof data === 'object' &&
    'human' in data &&
    'isoString' in data &&
    'unixEpoch' in data
  )
}

/**
 * @param {import('./types.ts').DateConversionContextPayload} data
 */
export const assertIsDateConversionContextPayload = (data) => {
  if (!isDateConversionContextPayload(data)) {
    throw new Error('Invalid DateConversionContextPayload')
  }
}


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


  const rootEl = element.shadowRoot
  const timeEl = rootEl.querySelector('time')
  if (!timeEl) {
    const message = `No time element found! ${errorMessageSuffix}`
    throw new Error(message)
  }

  /**
   * @param {import('./types.ts').DateConversionContextPayload} data
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
    rootEl.host.setAttribute('data-state', 'loaded')
  }
  return handleDateContextResponse
}
