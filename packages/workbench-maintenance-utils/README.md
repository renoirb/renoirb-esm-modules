# Workbench Maintenance Utils

## Dev Server

The [**dev-server.ts** Deno task](./src/deno/dev-server.ts) imports a component
that allows seeing how the component behaves.

### Setup

Create a file you'll run with Deno.

The server will make use of a '`my-component-showcase`' custom element. You will
have to tell where to use that component.

You can look at
[component-showcase-element](../component-showcase-element/README.md) package
for an example implementation, so you could make your own.

```ts
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
```

A minimal `workbench.html` in your package might look like this:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>SomeExample Workbench</title>
    <script type="module">
      /* What you need to do in order to use your new element... */
    </script>
  </head>
  <body>
    <section>
      <my-component-showcase name="SomeExampleElement" slots="alpha bravo">
        <template slot="alpha" title="Simplest">
          <!-- Use case alpha -->
        </template>

        <template slot="bravo" title="Simplest">
          <!-- Another use-case -->
        </template>
      </my-component-showcase>
    </section>
  </body>
</html>
```
