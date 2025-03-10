const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24

export const calculateDuration = (startDate, endDate) => {
  // Convert to UTC to avoid timezone/DST issues
  const [startYear, startMonth] = startDate.split('-').map(Number)
  const start = Date.UTC(startYear, startMonth - 1, 1)

  const end = endDate
    ? Date.UTC(
        ...endDate
          .split('-')
          .map(Number)
          .map((n, i) => (i === 1 ? n - 1 : n)),
      )
    : Date.now()

  if (isNaN(start)) {
    throw new Error('Invalid start date')
  }

  if (isNaN(end)) {
    throw new Error('Invalid end date')
  }

  if (start > end) {
    throw new Error('Start date must be before end date')
  }

  // Get total months between dates
  const totalMonths =
    (new Date(end).getUTCFullYear() - new Date(start).getUTCFullYear()) * 12 +
    (new Date(end).getUTCMonth() - new Date(start).getUTCMonth())

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  // Calculate remaining days
  const yearMonthDate = new Date(
    Date.UTC(
      new Date(start).getUTCFullYear() + years,
      new Date(start).getUTCMonth() + months,
      new Date(start).getUTCDate(),
    ),
  )

  const days = Math.floor((end - yearMonthDate.getTime()) / MILLISECONDS_IN_DAY)

  return {
    years,
    months,
    days,
  }
}
