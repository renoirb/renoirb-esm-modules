

/**
 * Transform string from "fooBarBaz" (camelCase) into "foo-bar-baz" (kebab-case)
 */
export const transformCamelCaseToKebab = (str) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())
