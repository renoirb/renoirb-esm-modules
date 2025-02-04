const DEFAULT_VARIANT = 'info'

export function createVariantManager(options = {}) {
  let selectedVariant = options.defaultVariant ?? DEFAULT_VARIANT

  return {
    getDefaultVariant() {
      return selectedVariant
    },
    setDefaultVariant(variant) {
      assertValidVariant(variant)
      selectedVariant = variant
    },
  }
}
