# @renoirb/jsonresume-element


## Entry Points

### Browser (`browser.mjs`)

```javascript
import { JsonResumeParentElement } from './src/browser/element.mjs'
import { WorkExperienceElement } from './src/browser/work-experience-element.mjs'

export {
  JsonResumeParentElement,
  WorkExperienceElement,
}
```

## Usage Examples


### Browser (Core Version)

```html
<html>
  <head>
    <script type="importmap">
      {
        "imports": {
          "@renoirb/jsonresume-element": "https://dist.renoirb.com/esm/own/jsonresume-element/v0.1.0/browser.mjs",
          "@renoirb/jsonresume-utils": "https://dist.renoirb.com/esm/own/jsonresume-utils/v0.1.0/core.mjs"
        }
      }
    </script>
    <script type="module">
      import {
        JsonResumeElement,
        WorkExperienceElement,
      } from '@renoirb/jsonresume-element'
      customElements.define('app-work-experience', WorkExperienceElement)
      customElements.define('app-jsonresume', JsonResumeElement)
    </script>
  </head>
  <body>

    <app-jsonresume>
      <div id="work-experience" slot="work-experience">
      </div>
    </app-jsonresume>

    <script type="module">
      import {
        getJsonResumeOverrideWith,
      } from '@renoirb/jsonresume-utils'
      ;(async function init() {

        // Web version with fallback URLs
        const resumeData = await getJsonResumeOverrideWith(
          'https://example.com/override.yaml',
          [
            'https://my-site.com/base.yaml',
            'https://backup.com/fallback.yaml',
          ],
        )

        // Fill the basic info
        const { basics = {}, work = [] } = resumeData
        const targetEl = document.querySelector('app-jsonresume')
        targetEl.renderBasics(basics)
        targetInnerEl.innerHTML = ''

        // Add work experience by hand:
        let el = document.createElement('app-work-experience')
        el.setAttribute('data-entity-name', 'ACME Corp')
        el.setAttribute('data-position-title', 'Programmer')
        el.setAttribute('data-date-begin', '2024-09-01')
        el.setAttribute('data-entity-url', 'https://example.org')
        targetInnerEl.appendChild(el)

        // Or iterate resumeData to fill values
        for (const experience of resumeData?.work) {
          // ...
        }
      })()
    </script>
  </body>
</html>
```