const classMaps = new Map([
  [
    'warm',
    {
      fillColor: 'bg-orange-400',
      svgFillColor: 'fill-orange-400',
      textColor: 'text-orange-600',
    },
  ],
  [
    'neutral',
    {
      fillColor: 'bg-blue-400',
      svgFillColor: 'fill-blue-400',
      textColor: 'text-blue-600',
    },
  ],
  [
    'cool',
    {
      fillColor: 'bg-cyan-300',
      svgFillColor: 'fill-cyan-300',
      textColor: 'text-cyan-600',
    },
  ],
])

const mapKeys = [...classMaps.keys()]

export const getClassMap = (key) => {
  const lookupKey = key
  if (!lookupKey) {
    const message = 'No key provided and no default key specified'
    throw new Error(message)
  }
  const result = classMaps.get(lookupKey)
  if (!result) {
    const message = `No class names for key: "${lookupKey}", we only have ${mapKeys}`
    throw new Error(message)
  }
  return result
}
