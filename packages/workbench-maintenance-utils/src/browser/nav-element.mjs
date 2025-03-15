const STYLE = `
  :host {
    display: block;
  }
  :host > nav {
    margin: 1rem 0;
    padding: 1rem;
    background: #f0f0f0;
    border-radius: 0.5rem;
  }
  .ul {
    padding: 1em;
    background-color: #e5e5e5;
    margin-bottom: 1em;
  }
  .current {
    font-weight: bold;
  }
`

const TEMPLATE = `
  <nav>
    <h3 id="title"></h3>
    <ul></ul>
  </nav>
`

const generateListItems = (
  /*                    */
  items,
  current,
) => {
  const out = items
    .sort()
    .map(
      (pkg) =>
        `<li><a href="/?package=${pkg}" ${
          pkg === current ? 'class="current"' : ''
        }>${pkg}</a></li>`,
    )

  return out
}

/**
 * Navigation For Current Workbench Packages
 *
 * ```
 * <div>
 *   <h3>Available Packages:</h3>
 *   <ul>
 *     <li><a href="/?package=inline-note-element" class="current">inline-note-element</a></li>
 *     <li><a href="/?package=notice-box-element">notice-box-element</a></li>
 *     <li><a href="/?package=value-date-element">value-date-element</a></li>
 *   </ul>
 * </div>
 * ```
 */
export class WorkbenchNavElement extends HTMLElement {
  static get observedAttributes() {
    return [
      /*                 */
      'data-workbench-current',
      'data-workbench-list',
      'data-workbench-title',
    ]
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    const styleElement = new CSSStyleSheet()
    styleElement.replaceSync(STYLE)
    this.shadowRoot.adoptedStyleSheets = [styleElement]
    const templateElement = document.createElement('template')
    templateElement.innerHTML = TEMPLATE
    this.shadowRoot.appendChild(templateElement.content.cloneNode(true))
  }

  connectedCallback() {
    const current = this.getAttribute('data-workbench-current')
    const list = this.getAttribute('data-workbench-list').split(' ')
    const title =
      this.getAttribute('data-workbench-title') ?? 'Available Packages'
    this.shadowRoot.getElementById('title').textContent = title + ':'
    try {
      this.#render(list, current)
    } catch (error) {
      console.error(error)
    }
  }

  #render = (list, current) => {
    const listItems = generateListItems(list, current)
    this.shadowRoot.querySelector('ul').innerHTML = listItems.join('\n')
  }
}
