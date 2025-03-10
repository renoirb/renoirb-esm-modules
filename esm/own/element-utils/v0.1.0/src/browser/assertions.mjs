import { isValidCustomElementName, isValidSlotName } from './issers.mjs'
import { normalizeAttributeName } from './normalization.mjs'

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

export const assertValidCustomElementName = (
  name /*: string */ = '',
) /*: assert is ... */ => {
  if (!isValidCustomElementName(name)) {
    throw new Error(
      `Invalid element name "${name}". Must start with a letter and contain only letters, numbers, and hyphens.`,
    )
  }
}
