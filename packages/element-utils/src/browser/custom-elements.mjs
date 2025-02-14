import { assertValidCustomElementName } from './assertions.mjs'

export const registerCustomElement = (
  { customElements },
  elementName = '',
  elementClass = Error,
) => {
  assertValidCustomElementName(elementName)
  if (!customElements.get(elementName)) {
    customElements.define(elementName, elementClass)
  } else {
    const message = `ERR customElements.define <${elementName} />, already defined.`
    throw new Error(message)
  }
}

export const createLinkStlesheets = (
  { document },
  elementName,
  stylesExternal = [],
) => {
  const frag = document.createDocumentFragment()
  for (const href of stylesExternal) {
    const linkElem = document.createElement('link')
    linkElem.setAttribute('rel', 'stylesheet')
    linkElem.setAttribute('href', href)
    linkElem.setAttribute('data-related-to', elementName)
    frag.appendChild(linkElem)
  }
  return frag
}
