/**
 * Checks if input is a non-empty string and not 'null'
 * @param {unknown} input - Value to check
 * @returns {boolean}
 */
export const isNotNullOrStringEmptyOrNull = (input) =>
  typeof input === 'string' && input !== '' && input !== 'null'

/**
 * Validates HTML custom element attribute names
 * @see https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
 * @param {string} name
 * @returns {boolean}
 */
export const isValidAttributeName = (name) => {
  return /^[a-z][a-z0-9-]*$/.test(name)
}

/**
 * Validates DOM slot names
 * @param {string} name
 * @returns {boolean}
 */
export const isValidSlotName = (name) => {
  return /^[a-z][a-z0-9-]*$/.test(name)
}

/* file: packages/element-utils/src/core/normalization.mjs */

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
    .map((item) => item.trim().toLowerCase())
}

/* file: packages/element-utils/src/core/assertions.mjs */

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

/**
 * Asserts value is a valid slot name
 * @param {string} name
 * @param {Set<string>} [reserved]
 * @throws {Error}
 */
export const assertValidSlotName = (name, reserved = new Set()) => {
  const normalized = normalizeAttributeName(name)

  if (reserved.has(normalized)) {
    throw new Error(`"${name}" is a reserved slot name`)
  }

  if (!isValidSlotName(normalized)) {
    throw new Error(
      `Invalid slot name "${name}". Must start with a letter and contain only letters, numbers, and hyphens`,
    )
  }

  return normalized
}
