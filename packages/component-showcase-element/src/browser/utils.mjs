import {
  /*                          */
  assertNonEmptyString,
  assertValidSlotName,
  normalizeSpaceSeparated,
} from './element-utils.mjs'

export const validateSlotsList = (slotsAttr) => {
  assertNonEmptyString(slotsAttr, 'slots attribute is required')

  const slotNames = new Set()
  const normalized = normalizeSpaceSeparated(slotsAttr).map((slot) => {
    const normalized = assertValidSlotName(slot)
    if (slotNames.has(normalized)) {
      throw new Error(`Duplicate slot name "${slot}"`)
    }
    slotNames.add(normalized)
    return normalized
  })

  if (normalized.length === 0) {
    throw new Error('At least one display slot is required')
  }

  return normalized
}
