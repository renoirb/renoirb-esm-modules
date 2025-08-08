const EMPTY_JSON_RESUME = {
  meta: {},
  basics: {},
  work: [],
  education: [],
  awards: [],
  skills: [],
}

const sortChronologically = (a, b) => {
  const [leftYear, leftMonth] = a.startDate.split('-')
  const [rightYear, rightMonth] = b.startDate.split('-')

  let outcome = NaN
  if (+leftYear < +rightYear) {
    outcome = 1
  } else if (+leftYear > +rightYear) {
    outcome = -1
  } else {
    // Year are equals, so, we gotta check for month now
    if (+leftMonth < +rightMonth) {
      outcome = 1
    } else if (+leftMonth > +rightMonth) {
      outcome = -1
    } else {
      outcome = 0
    }
  }

  return outcome
}

export const mergeJsonResume = (overrides, base = EMPTY_JSON_RESUME) => {
  const result = structuredClone({ ...EMPTY_JSON_RESUME, ...base })

  if (overrides.work) {
    overrides.work.forEach((override) => {
      const index = result.work.findIndex(
        (job) => job.startDate === override.startDate,
      )
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

  Reflect.set(result.meta, 'lastModified', new Date().toISOString())

  if (Reflect.has(overrides, 'basics')) {
    const { summary, label } = overrides?.basics ?? {}
    if (typeof summary === 'string') {
      Reflect.set(result.basics, 'summary', summary)
    }
    if (typeof label === 'string') {
      Reflect.set(result.basics, 'label', label)
    }
  }

  Reflect.set(result, 'work', result.work.sort(sortChronologically))

  return result
}
