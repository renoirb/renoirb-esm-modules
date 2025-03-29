export const currentIndicator = (
  label = 'Current Position',
  description = 'A green checkmark in a circle indicating current or active position',
  color = '#4CAF50',
  backgroundColor = '#e6f7e6',
) => {
  const TEMPLATE = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-labelledby="currentTitle currentDesc" width="1em" height="1em">
      <title id="currentTitle">${label}</title>
      <desc id="currentDesc">${description}</desc>
      <circle cx="12" cy="12" r="10" fill="${backgroundColor}" stroke="${color}" stroke-width="1.5"/>
      <path d="M9,12 L11,14 L15,10" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
  return TEMPLATE
}
