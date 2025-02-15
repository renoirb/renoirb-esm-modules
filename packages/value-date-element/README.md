# Value Date Element

Batteries non included element specialized for displaying date related values.

## Setup

Leverage [**Context API**][renoirb-context-api-readme], to handle date
formatting.

Important: Register the `context-request` event handler _BEFORE_ registering

### Step 1: Register the context-request

See example in [workbench.mjs](workbench.mjs)

### Step 2: Import and register the CustomElement

```html
<script type="module">
  import ValueDateElement from 'https://renoirb.com/esm-modules/value-date-element'
  customElements.define('value-date', ValueDateElement)
</script>
```

## References

[renoirb-context-api-readme]:
  https://renoirb.com/esm-modules/context-api/README.md
