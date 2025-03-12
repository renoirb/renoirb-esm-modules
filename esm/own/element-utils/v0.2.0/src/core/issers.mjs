/**
 * Normally "boolean" attribute on HTML elements is when
 * the attribute is there or not.
 *
 * @param {*} input
 * @returns
 */
export const isNotNullOrStringEmptyOrNull = (input) =>
  typeof input === 'string' && input !== '' && input !== 'null'
