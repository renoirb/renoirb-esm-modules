// rel=#MakePurgeCSSNotPurgeThisPlease
// Idea is to have inventory of all possible permutations
// so that PurgeCSS won't purge them in the component
const ALL_VARIANTS = new Set(['info', 'warn', 'error'])

export const assertValidVariant = (input) => {
  if (!ALL_VARIANTS.has(input)) {
    const these = [...ALL_VARIANTS].join(', ')
    const message = `Invalid variant "${input}", we only support ${these}`
    throw new Error(message)
  }
}

export const colorPicker = (type) /*: IColorTextColor */ => {
  let color = 'yellow'
  // Think about contrast for textColor
  let textColor = 'black'
  switch (type) {
    case 'warn':
      color = 'yellow'
      break

    case 'error':
      color = 'red'
      textColor = 'white'
      break

    case 'info':
    default:
      color = 'blue'
      textColor = 'white'
      break
  }

  return { color, textColor }
}

/**
 *
 * Copy from {@link https://github.com/renoirb/site/blob/2020/lib/runtime/tailwind/alert.ts}
 *
 * @param {C} type
 * @param {*} andRestForHackishPostCssThing
 * @returns
 */
export const styleMap = (
  variant /*: IAlertType */,
  andRestForHackishPostCssThing = false,
) /*: IStyleMapAlert */ => {
  assertValidVariant(variant)
  const allTypes = new Set([...ALL_VARIANTS])
  allTypes.delete(variant)

  const outer = []
  const heading = []

  const outerTokens = (cfg /*: IColorTextColor*/) /*: string[]*/ => [
    `bg-${cfg.color}-200`,
    `border-${cfg.color}-400`,
    `text-${cfg.textColor}-800`,
  ]

  const headingTokens = (cfg /*: IColorTextColor*/) /*: string[]*/ => [
    `bg-${cfg.color}-400`,
    `text-${cfg.textColor}`,
  ]

  outer.push(...outerTokens(colorPicker(variant)))
  heading.push(...headingTokens(colorPicker(variant)))

  if (andRestForHackishPostCssThing) {
    for (const other of [...allTypes]) {
      outer.push(...outerTokens(colorPicker(other)))
      heading.push(...headingTokens(colorPicker(other)))
    }
  }

  return {
    outer,
    heading,
  }
}
