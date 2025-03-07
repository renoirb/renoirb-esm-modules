export const OUTER_WORKBENCH_APP_LAYOUT_STYLE = `
  body {
    font-family: system-ui, sans-serif;
    max-width: 80ch;
    margin: 2rem auto;
    padding: 0 1rem;
    background-color: #fff;
  }
`

export const attachDocumentStyle = (w /*: Window */) => {
  const styleElement = w.document.createElement('style')
  styleElement.innerText = OUTER_WORKBENCH_APP_LAYOUT_STYLE
  w.document.head.appendChild(styleElement)
}
