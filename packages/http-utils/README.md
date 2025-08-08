# HTTP-Utils

Dependency-free utilities to handle HTTP request patterns.

## Implemented Patterns

### Fallback fetching

When we need to have at least one of a payload, ideally the first, but when we
have fallback.

```js
import { getFirstSuccessfulResponse } from '@renoirb/http-utils'

const MUST_BE_AT_LEAST_ONE_OF = [
  'https://example.org/some-file.json',
  'https://example.come/some-file1.json',
  'https://example.come/some-file/fallback.json',
]

const response = await getFirstSuccessfulResponse(MUST_BE_AT_LEAST_ONE_OF)
const parsed = response.json()
```

### Response Caching

When we want to be savvy with HTTP requests and re-use whenever applicable.

Essentially an URL to Text memozation technique.

```js
import { HttpClientWithCache } from '@renoirb/http-utils'

const client = new HttpClientWithCache()

// ...

// Same example set of URLs as Fallback fetching
const MUST_BE_AT_LEAST_ONE_OF = [
  'https://example.org/some-file.json',
  'https://example.come/some-file1.json',
  'https://example.come/some-file/fallback.json',
]
// Same as getFirstSuccessfulResponse, but we get the text for later parsing.
let payloadJsonText = await client.getFirstSuccessful(MUST_BE_AT_LEAST_ONE_OF)
let parsedJson = JSON.parse(payloadJsonText)

// Or if you want only one try:
const payloadYamlText = await client.getCachedResponseText(
  'https://example.org/some-other-file.yaml',
)
// ... Parse the YAML
```

## Future HTTP Patterns:

- **Exponential backoff** with retry logic
- **Timeout handling**
- **Request deduplication** (multiple calls to same URL while first is pending)
- **Request queuing/throttling**
- **Progress tracking** for large downloads
- **Conditional requests** (ETags, If-Modified-Since)
