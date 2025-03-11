import { devServer } from '@renoirb/workbench-maintenance-utils/deno.ts'

/**
 * Define your own 'my-component-showcase' element to be used in workbench.
 */
const COMPONENT_SHOWCASE_SCRIPT_STRING = `
  import { ComponentShowcaseElement } from '@renoirb/component-showcase-element'
  customElements.define('my-component-showcase', ComponentShowcaseElement)
`

await devServer({
  port: 8000,
  defaultPackage: 'inline-note-element',
  componentShowcaseScriptAsString: COMPONENT_SHOWCASE_SCRIPT_STRING,
})
