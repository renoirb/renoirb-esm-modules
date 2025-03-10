/**
 * @param {string[]} list of items to create a list from
 * @param {string} type of list to create (ul or ol)
 */
export const createListElement = (items = [], type = 'ul') => {
  if (['ul', 'ol'].indexOf(type) === -1) {
    throw new Error(`Invalid list type: ${type}`)
  }
  const element = document.createElement(type)
  for (const textContent of items) {
    const li = document.createElement('li')
    li.textContent = textContent
    element.appendChild(li)
  }
  return element
}

export const createDefinitionListElement = (items = [['', '']]) => {
  const element = document.createElement('dl')
  for (const item of items) {
    if (Array.isArray(item) && item.length === 2) {
      const [dtText, ddText] = item
      if (typeof dtText === 'string' && dtText.length > 0) {
        const dt = document.createElement('dt')
        dt.textContent = dtText
        element.appendChild(dt)
      }
      if (typeof ddText === 'string' && ddText.length > 0) {
        const dd = document.createElement('dd')
        dd.textContent = ddText
        element.appendChild(dd)
      }
    } else {
      const message = `Unexpected input, we need an array of two item arrays`
      throw new Error(message)
    }
  }
  return element
}
