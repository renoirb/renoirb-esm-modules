import { isNotNullOrStringEmptyOrNull } from './issers.mjs'

/**
 * Asserts value is a non-empty string
 * @param {unknown} input
 * @param {string} [message]
 * @throws {Error}
 */
export const assertNonEmptyString = (
  input,
  message = 'Value must be a non-empty string',
) => {
  if (!isNotNullOrStringEmptyOrNull(input)) {
    throw new Error(message)
  }
}
