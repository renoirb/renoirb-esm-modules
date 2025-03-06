/**
 * Checks if input is a non-empty string and not 'null'
 * @param {unknown} input - Value to check
 * @returns {boolean}
 */
export const isNotNullOrStringEmptyOrNull = (input) =>
  typeof input === 'string' && input !== '' && input !== 'null'
