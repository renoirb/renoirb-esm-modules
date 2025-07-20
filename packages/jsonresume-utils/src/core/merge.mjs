const EMPTY_JSON_RESUME = {
  meta: {},
  basics: {},
  work: [],
  education: [],
  awards: [],
  skills: [],
}

export const mergeJsonResume = (overrides, base = EMPTY_JSON_RESUME) => {
  const result = structuredClone({ ...EMPTY_JSON_RESUME, ...base })

  if (overrides.work) {
    overrides.work.forEach((override) => {
      const index = result.work.findIndex((job) => job.startDate === override.startDate)
      if (index !== -1) {
        // Merge specific properties
        if (override.highlights !== undefined) {
          result.work[index].highlights = structuredClone(override.highlights)
        }
        if (override.summary) {
          result.work[index].summary = structuredClone(override.summary)
        }
      }
    })
  }

  return result
}
