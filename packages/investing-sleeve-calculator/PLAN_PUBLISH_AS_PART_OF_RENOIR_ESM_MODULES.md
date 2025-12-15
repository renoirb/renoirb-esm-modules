---
aliases:
  - PLAN_PUBLISH_AS_PART_OF_RENOIRESM_MODULES
title: PLAN_PUBLISH_AS_PART_OF_RENOIRESM_MODULES
up: '[[Home]]'
tags:
  - status/draft
created: 2025-12-15
modified: 2025-12-15
related:
  - '[[2025-12]]'
earlier-title-key: PLAN_PUBLISH_AS_PART_OF_RENOIRESM_MODULES
---

# PLAN_PUBLISH_AS_PART_OF_RENOIRESM_MODULES

## Summary

> [!warning] TODO
> Reorganize this context for clarity

This package will be the first in the “`#^@renoirb/investing-*#`” (_investing_) [[Project Renoir ESM Modules]] as part of [[Professional Development ESM Module Distribution System|my public open-source modules library]] and [[Professional Development Cross Runtime Module Architecture|research on cross-runtime code dependency management]] to be available as Deno, Node and [[Published Renoir ESM Modules|import them from my ESM Modules served over HTTP]] on my [[Self-Hosting Dist.RenoirB.Com]] registry so we can import as

```html
<!-- importMap in the document head as early as possible -->
<script type="importmap">
  {
    "imports": {
      "@renoirb/investing-sleeve-calculator": "https://dist.renoirb.com/esm/own/investing-sleeve-calculator/v1.0.0/browser.mjs"
    }
  }
</script>
<script type="module">
  import SleeveCalculator from '@renoirb/investing-sleeve-calculator'
  // …
</scrip>
```

But would also be accessible via Deno too

**deno.json:**

```json
{
  "imports": {
    "@renoirb/investing-sleeve-calculator": "jsr:…"
  }
}
```

**code:**

```typescript
import SleeveCalculator from '@renoirb/investing-sleeve-calculator'

// …
```

## Details
