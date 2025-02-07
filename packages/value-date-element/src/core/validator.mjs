/**
 * @param {import('./types.ts').DateContextPayload} data
 */
export const isDateContextPayload = (data) => {
  return (
    data &&
    typeof data === 'object' &&
    'human' in data &&
    'isoString' in data &&
    'unixEpoch' in data
  )
}

/**
 * @param {import('./types.ts').DateContextPayload} data
 */
export const assertIsDateContextPayload = (data) => {
  if (!isDateContextPayload(data)) {
    throw new Error('Invalid DateContextPayload')
  }
}
