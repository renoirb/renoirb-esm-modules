export const OUTER_WORKBENCH_APP_LAYOUT_STYLE = `
  body {
    font-family: system-ui, sans-serif;
    background-color: #fff;
  }
  body:has(> section) {
    max-width: 80ch;
    margin: 2rem auto;
    padding: 0 1rem;
  }
  body:has(app-layout) {
    /* Nothing to do here just yet */
  }
`

export const attachDocumentStyle = (w /*: Window */) => {
  const styleElement = w.document.createElement('style')
  styleElement.innerText = OUTER_WORKBENCH_APP_LAYOUT_STYLE
  w.document.head.appendChild(styleElement)
}
