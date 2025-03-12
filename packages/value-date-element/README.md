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
<script type="importmap">
  {
    "imports": {
      "@renoirb/value-date-element": "https://dist.renoirb.com/esm/own/value-date-element/v1.0.0/browser.mjs"
    }
  }
</script>
<script type="module">
  import { ValueDateElement } from '@renoirb/value-date-element'
  customElements.define('value-date', ValueDateElement)
</script>
```

## More to come

- Display two dates as range
  - Calculate duration
  - When no end date, use "today", and write "*current*" or another similar label. So we can translate

### Calculate Distance Dates

#### Display

To specify a duration using a date, with the length and direction (ago, upcoming)

- https://gist.github.com/renoirb/3ac53c986c0284d6f0be585cc5bac3c9
- `AppContentDate` https://github.com/renoirb/site/blob/2020/components/global/AppContentDate.vue


#### `DateRange` form

Form that allows selecting two dates according to limitations such as only in the future, or only in the past, etc.

- https://github.com/renoirb/evenements-entre-deux-dates/blob/main/src/components/DateRange.vue

#### Relative Date Range Form

- https://github.com/renoirb/evenements-entre-deux-dates/blob/main/src/components/RelativeDateRangeForm.vue

### Coercers and sanity

- Takes an UNIX Epoch number, coerces into milliseconds, seconds
- Check if browser Intl `hasIntl`

- https://github.com/renoirb/experiments-201908-rush-typescript-just-bili-monorepo/blob/master/packages/date-epoch/src/helpers.ts


## References

- [@renoirb/context-api **Context API**][renoirb-context-api-readme] as per W3C’s Web Component Community Group ContextAPI protocol

[renoirb-context-api-readme]:
  https://github.com/renoirb/renoirb-esm-modules/blob/main/packages/context-api/README.md
