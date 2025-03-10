/**
 * Normalizes strings for use in HTML attributes and slots
 * @param {string} input
 * @returns {string}
 */
export const normalizeAttributeName = (input) => {
  return input.trim().toLowerCase()
}

/**
 * Splits space-separated values and normalizes each item
 * @param {string} input
 * @returns {string[]}
 */
export const normalizeSpaceSeparated = (input) => {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((item) => normalizeAttributeName(item))
}
