# @renoirb/jsonresume-utils

## Function Signatures

### Core (`src/core/override.mjs`)

**Web Platform - HTTP URLs only, with fallback arrays**

```javascript
getJsonResumeOverrideWith(
  urlToYamlSourceOverride: string,     // HTTP URL
  urlToYamlSourceBase?: string[]       // Array of fallback HTTP URLs
): Promise<JSONResume>
```

### Deno (`src/deno/override.mjs`)

**CLI Focused - Files + URLs, direct parameters**

```javascript
getJsonResumeOverrideWith(
  baseUrlOrPath: string,     // Base resume (HTTP URL or local file)
  overridePath: string       // Override file (local file being edited)
): Promise<JSONResume>
```

## Entry Points

### Core (`core.mjs`)

```javascript
export {
  mergeJsonResume,
  getJsonResumeOverrideWith, // Web platform version
} from './src/core/jsonresume-override.mjs'
```

### Deno (`deno.mjs`)

```javascript
export { mergeJsonResume } from './src/core/jsonresume-merge.mjs'

export {
  getJsonResumeOverrideWith, // Deno CLI version
} from './src/deno/jsonresume-override.mjs'
```


## Usage Examples

### CLI (Deno Version)

```bash
# Remote base + local overrides (main workflow)
deno task merge-resume https://my-site.com/base-resume.yaml ./targeted-cv.yaml

# Local base + local overrides (development)
deno task merge-resume ./base-resume.yaml ./targeted-cv.yaml

# Self-contained override (ignores first argument)
deno task merge-resume ignored ./self-contained-cv.yaml
```

### Deno Script (Deno Version)

```javascript
import { getJsonResumeOverrideWith } from '@renoirb/jsonresume-microfrontend/deno'

// CLI-style usage in scripts
const resume = await getJsonResumeOverrideWith(
  './base-resume.yaml',
  './targeted-cv.yaml',
)
```
