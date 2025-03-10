const RE_DOM_ATTRIBUTE_NAME = /^[a-z][a-z0-9-]*$/

/**
 * Exception for Valid Element Names
 *
 * @see https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
 */
export const ELEMENT_NAME_THAT_MUST_NOT_BE = new Set([
  'annotation-xml',
  'color-profile',
  'font-face',
  'font-face-src',
  'font-face-uri',
  'font-face-format',
  'font-face-name',
  'missing-glyph',
])

/**
 * Validates HTML custom element names
 * @param {string} name
 * @returns {boolean}
 */
export const isValidCustomElementName = (name) => {
  return (
    /^[a-z][\w-]*$/.test(name) &&
    ELEMENT_NAME_THAT_MUST_NOT_BE.has(name) === false
  )
}

/**
 * Validates HTML custom element attribute names
 * @see https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
 * @param {string} name
 * @returns {boolean}
 */
export const isValidAttributeName = (name) => {
  return RE_DOM_ATTRIBUTE_NAME.test(name)
}

/**
 * Validates DOM slot names
 * @param {string} name
 * @returns {boolean}
 */
export const isValidSlotName = (name) => {
  return RE_DOM_ATTRIBUTE_NAME.test(name)
}
