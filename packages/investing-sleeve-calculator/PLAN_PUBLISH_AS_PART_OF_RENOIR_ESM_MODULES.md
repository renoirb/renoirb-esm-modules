# Plan - Publish as part of **renoirb/renoirb-esm-modules**

## Summary

**Status:** ✅ **COMPLETE** - Package published and available across all runtimes

This package is the first in the "`@renoirb/investing-*`" series as part of the renoirb-esm-modules monorepo. Successfully published to JSR with cross-runtime compatibility (Deno, Node, Browser).

**Published Package:**
- JSR: `jsr:@renoirb/investing-sleeve-calculator@^0.1.1`
- npm: `npm:@jsr/renoirb__investing-sleeve-calculator@^0.1.1`
- Browser: `https://esm.sh/jsr/@renoirb/investing-sleeve-calculator@0.1.1`

**Import Examples:**

**Browser (via esm.sh CDN):**
```html
<script type="importmap">
  {
    "imports": {
      "@renoirb/investing-sleeve-calculator": "https://esm.sh/jsr/@renoirb/investing-sleeve-calculator@0.1.1"
    }
  }
</script>
<script type="module">
  import { SleeveCalculator } from '@renoirb/investing-sleeve-calculator'
  // ... use calculator
</script>
```

**Deno:**
```json
{
  "imports": {
    "@renoirb/investing-sleeve-calculator": "jsr:@renoirb/investing-sleeve-calculator@^0.1.1"
  }
}
```

**Node/npm:**
```bash
npm install @jsr/renoirb__investing-sleeve-calculator
```

**All runtimes:**
```typescript
import { SleeveCalculator, DriftCalculator } from '@renoirb/investing-sleeve-calculator'
// ... use imports
```

## Details

### Current Status

**✅ All Phases Complete:**

- ✅ Core implementation (`SleeveCalculator` + `DriftCalculator`)
- ✅ Comprehensive test suite (15 suites, 49 test steps, all passing)
- ✅ Type definitions and exports
- ✅ Documentation (CLAUDE.md, PACKAGE_CONTEXT.md, this PLAN)
- ✅ Code quality (lint clean, formatted, Deno 2.6.1 compliant)
- ✅ Interactive CLI tool (`deno.ts`)
- ✅ Barrel file structure (`core.ts` → `src/index.ts`)
- ✅ JSR publishing metadata in `deno.json`
- ✅ Published to JSR (v0.1.1)
- ✅ npm compatibility verified
- ✅ Browser imports available via esm.sh
- ✅ Transpilation output analyzed and documented

**⏭️ Optional Future Work:**

- Custom dist.renoirb.com CDN (esm.sh works well for now)
- Monorepo import mapping (workspace-only sufficient currently)

---

## Implementation Approach

### Strategy: JSR-First with Deno Transpilation

Instead of manually creating barrel files first, we'll:

1. **Let JSR/Deno handle transpilation** - Publish TypeScript directly to JSR
2. **Observe transpiled output** - See what Deno generates automatically
3. **Learn from JSR's output** - Understand the transpiled structure
4. **Then optimize** - Create manual `core.mjs` barrel files based on what we learned

**Why this approach:**

- JSR automatically transpiles TypeScript → JavaScript
- No need to guess the correct transpilation pattern
- Learn best practices from Deno's own tooling
- Can add manual optimizations after understanding the output

---

## Implementation Plan

### Phase 1: JSR Publishing Configuration (TypeScript-First)

**Goal:** Configure package for JSR publication using TypeScript exports directly

**Steps:**

1. **Update `deno.json` with JSR metadata and TypeScript exports**
   ```json
   {
     "name": "@renoirb/investing-sleeve-calculator",
     "version": "0.1.0",
     "description": "Pure TypeScript calculation engine for portfolio sleeve allocation and drift analysis",
     "license": "MIT",
     "exports": {
       ".": "./src/index.ts"
     },
     "tasks": {
       "cli": "deno --allow-read cli.ts",
       "test": "deno task test:src && deno task test:doc-only",
       "test:src": "deno test",
       "test:doc-only": "deno check --doc-only **/*.md"
     },
     "imports": {
       "@std/assert": "jsr:@std/assert@1",
       "@std/yaml": "jsr:@std/yaml@^1.0.10"
     }
   }
   ```

   **Key points:**
   - Exports point directly to TypeScript source (`./src/index.ts`)
   - JSR will handle transpilation automatically
   - No need for `core.mjs` yet

2. **Verify LICENSE exists**
   - Check monorepo root for LICENSE file
   - Or add package-specific LICENSE if needed

3. **Ensure README.md has usage examples**
   - Should show import and basic usage
   - Will appear on JSR package page

---

---

### Phase 2: Dry-Run Publishing Test

**Goal:** Verify package structure before actual publication

**Steps:**

1. **Run `deno publish --dry-run`**
   ```bash
   cd packages/investing-sleeve-calculator
   deno publish --dry-run
   ```

   This will:
   - Validate `deno.json` configuration
   - Check exports are correct
   - Show what files will be published
   - Identify any issues before actual publish

2. **Review dry-run output**
   - Check file list (should include `src/`, `README.md`, etc.)
   - Verify no unwanted files included
   - Note any warnings or errors

3. **Run all tests to ensure nothing broke**
   ```bash
   deno test
   ```

---

### Phase 3: First JSR Publication

**Goal:** Publish to JSR and observe Deno's transpilation output

**Steps:**

1. **Choose version number**
   - Option A: `0.1.0` (experimental first publish)
   - Option B: `1.0.0` (stable first release)
   - Recommendation: Start with `0.1.0` to test the process

2. **Publish to JSR**
   ```bash
   cd packages/investing-sleeve-calculator
   deno publish
   ```

   **What happens:**
   - Deno validates package structure
   - Transpiles TypeScript → JavaScript automatically
   - Publishes to JSR registry
   - Generates documentation from JSDoc comments

3. **Verify publication on JSR**
   - Visit: `https://jsr.io/@renoirb/investing-sleeve-calculator`
   - Check package page shows correct metadata
   - Review auto-generated documentation
   - **IMPORTANT:** Examine transpiled JavaScript output

4. **Test installation**
   ```bash
   # In a fresh directory
   deno add @renoirb/investing-sleeve-calculator
   ```

5. **Test import works**
   ```typescript
   import {
     DriftCalculator,
     SleeveCalculator,
   } from '@renoirb/investing-sleeve-calculator'

   console.log('Imported successfully!')
   ```

---

### Phase 4: Learn from JSR Output & Optimize

**Goal:** Understand transpilation output and create optimized barrel files

**Steps:**

1. **Examine JSR transpiled output**
   - Visit JSR package page
   - Click "Source" or "Files" tab
   - Study the generated JavaScript files
   - Understand import/export patterns

2. **Document observations**
   - How does JSR structure the transpiled code?
   - What naming conventions does it use?
   - How are types handled?
   - What's the file structure?

3. **Create manual `core.mjs` barrel file** (if beneficial)
   Based on observations, create:
   ```javascript
   // Re-export everything from transpiled source
   export * from './src/index.ts'
   ```

4. **Update `deno.json` exports** (if using barrel files)
   ```json
   {
     "exports": {
       ".": "./core.mjs",
       "./core": "./core.mjs"
     }
   }
   ```

5. **Update root monorepo imports** (for local development)
   Add to `/deno.jsonc`:
   ```json
   "@renoirb/investing-sleeve-calculator": "./packages/investing-sleeve-calculator/core.mjs"
   ```

6. **Publish updated version** (if changes made)
   ```bash
   # Bump version in deno.json
   deno publish
   ```

**Note:** This phase is **optional**. Only proceed if JSR's automatic output needs optimization for monorepo use.

---

### Phase 5: HTTP Distribution (Optional/Future)

**Goal:** Serve package via dist.renoirb.com for browser imports

**Status:** Deferred until Phases 1-4 complete

**Future steps would include:**

- Use JSR's transpiled output or bundle separately
- Upload to dist.renoirb.com
- Create versioned URLs
- Test importmap example from Summary section

---

## Package Characteristics

**Runtime Compatibility:**

- ✅ Deno (primary target)
- ✅ Node.js (via JSR)
- ✅ Browser (pure TypeScript, no runtime-specific APIs)

**No External Dependencies:**

- Only uses Deno standard library (`@std/assert` for tests, `@std/yaml` for CLI)
- Core calculation engine has zero dependencies

**Pure Calculation Library:**

- No DOM APIs
- No Deno-specific APIs (except CLI tool uses `Deno.readTextFile`)
- No Node-specific APIs
- Stateless, pure functions

---

## Open Questions

1. **Version number:** Start at 0.1.0 or jump to 1.0.0 for first JSR publish?
2. **License:** MIT or something else? (Check monorepo root)
3. **Repository URL:** Confirm correct GitHub URL format
4. **CLI tool:** Should it be exported as separate entry point (e.g., `./cli`)?

---

## Success Criteria

**Phase 1: ✅ COMPLETE**

- ✅ `deno.json` has JSR metadata (description, license, exports)
- ✅ Exports point to TypeScript source (`./core.ts` → `./src/index.ts`)
- ✅ LICENSE exists (MIT - monorepo root)
- ✅ README.md has usage examples

**Phase 2: ✅ COMPLETE**

- ✅ `deno publish --dry-run` succeeded with no errors
- ✅ File list confirmed correct (excluded test files and PLAN docs)
- ✅ All tests passing (15 suites, 49 steps)

**Phase 3: ✅ COMPLETE**

- ✅ Package published to JSR successfully (v0.1.1)
- ✅ JSR page visible at `https://jsr.io/@renoirb/investing-sleeve-calculator`
- ✅ Can install via `deno add @renoirb/investing-sleeve-calculator`
- ✅ Import works in fresh Deno project
- ✅ Documentation auto-generated correctly
- ✅ npm compatibility confirmed (`npm:@jsr/renoirb__investing-sleeve-calculator@^0.1.1`)

**Phase 4: ✅ COMPLETE**

- ✅ Examined JSR's transpiled output via npm installation
- ✅ Documented observations about transpilation (see below)
- ⏭️ Created `core.mjs` barrel file - **NOT NEEDED** (JSR already provides `core.ts`)
- ⏭️ Updated monorepo imports - **DEFERRED** (workspace-only sufficient for now)

**Phase 5: ✅ BROWSER IMPORTS AVAILABLE**

- ✅ HTTP distribution available via esm.sh CDN
- ✅ Import URL: `https://esm.sh/jsr/@renoirb/investing-sleeve-calculator@0.1.1`
- ⏭️ Custom dist.renoirb.com - **OPTIONAL** (esm.sh works well)

---

## Notes for Implementation

**Phase 1-3 File Changes:**

1. `/packages/investing-sleeve-calculator/deno.json` - UPDATE (add JSR metadata)
2. `/packages/investing-sleeve-calculator/README.md` - VERIFY (usage examples)
3. Check for LICENSE at monorepo root

**Phase 4 File Changes (Optional):**

1. `/packages/investing-sleeve-calculator/core.mjs` - CREATE (if beneficial after observing JSR output)
2. `/deno.jsonc` (root) - UPDATE (if using barrel files)

**No Changes Needed:**

- `src/` files (already complete)
- Test files (already passing)
- Documentation files (already updated)

**CLI Tool Note:**

The `deno.ts` interactive tool is for development/testing. It doesn't need to be part of the library exports, but could be:

- Kept as development tool only (current recommendation)
- Exported as separate entry point: `"./cli": "./deno.ts"` (if users request)
- Documented in README as optional utility

---

## Key Insight: JSR Handles Transpilation

**Important:** JSR automatically transpiles TypeScript to JavaScript when you publish. You don't need to:

- Manually create `.js` or `.mjs` files
- Run a build step before publishing
- Worry about transpilation configuration

**Workflow:**

1. Write TypeScript in `src/`
2. Export via `src/index.ts`
3. Point `deno.json` exports to TypeScript files
4. Run `deno publish`
5. JSR handles the rest

**Learning Opportunity:**

After publishing, examine JSR's output to understand:

- How Deno transpiles TypeScript
- What the generated JavaScript looks like
- Whether manual barrel files add value
- Best practices for monorepo integration

This knowledge informs future decisions about creating manual `core.mjs` files for other packages in the monorepo.

---

## Transpilation Output Analysis (Phase 4 Results)

**What We Learned:**

After publishing v0.1.1 to JSR and examining the npm-installed output, we confirmed:

### File Structure Generated by JSR

```
node_modules/@renoirb/investing-sleeve-calculator/
├── core.js              # Transpiled barrel file
├── core.js.map          # Source map
├── core.ts              # Original TypeScript source
├── deno.js              # Transpiled CLI
├── deno.ts              # Original CLI source
├── _dist/               # Type definitions directory
│   ├── core.d.ts        # Type definitions for exports
│   ├── core.d.ts.map    # Type source map
│   └── src/
│       ├── types.d.ts
│       ├── calculator.d.ts
│       ├── drift.d.ts
│       └── *.d.ts.map
└── src/
    ├── calculator.js    # Transpiled implementation
    ├── calculator.ts    # Original TypeScript
    ├── calculator.js.map
    └── ...
```

### Transpilation Characteristics

**Import Path Transformation:**
- TypeScript: `export * from './src/index.ts'`
- JavaScript: `export * from "./src/index.js"`
- Extension changed, paths preserved

**Type Handling:**
- All TypeScript types removed from `.js` files
- Complete `.d.ts` type definitions generated
- Source maps for both `.js` and `.d.ts` files
- JSDoc comments preserved in JavaScript output

**Code Quality:**
- Clean, readable JavaScript
- Modern ESM syntax (`export`/`import`)
- Arrow functions preserved
- Template literals preserved
- No unnecessary transpilation to older syntax

**Example Transpiled Code:**

From `src/calculator.js`:
```javascript
export class SleeveCalculator {
  config;
  constructor(config){
    this.validateConfig(config);
    this.config = config;
  }
  calculate(sleeveName, totalAmountCAD, exchangeRate) {
    // ... implementation
  }
}
```

### Browser Distribution via esm.sh

**Discovery:** JSR itself does NOT serve files for HTTP imports. When requesting TypeScript files directly from JSR URLs, you get the `.ts` source.

**Solution:** Use esm.sh CDN which serves JSR packages as browser-ready ESM:

```
https://esm.sh/jsr/@renoirb/investing-sleeve-calculator@0.1.1
```

**What esm.sh provides:**
- ✅ Minified/bundled ESM module
- ✅ Modern ES2022 syntax
- ✅ CORS enabled (`Access-Control-Allow-Origin: *`)
- ✅ Immutable caching (`max-age=31536000`)
- ✅ TypeScript types header (`X-Typescript-Types`)
- ✅ Source maps available

**Browser Usage Example:**

```html
<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
    {
      "imports": {
        "@renoirb/investing-sleeve-calculator": "https://esm.sh/jsr/@renoirb/investing-sleeve-calculator@0.1.1"
      }
    }
  </script>
</head>
<body>
  <script type="module">
    import { SleeveCalculator } from '@renoirb/investing-sleeve-calculator'
    // Use the calculator...
  </script>
</body>
</html>
```

### Conclusion

**No manual `.mjs` files needed** - JSR's automatic transpilation is production-ready:
- Generates clean JavaScript
- Provides complete type definitions
- Works seamlessly with npm/Node
- Browser imports available via esm.sh

**For future packages:** Follow the same JSR-first approach. Manual barrel files only needed if:
- Custom bundling required
- Specific browser optimizations needed
- Private CDN (dist.renoirb.com) with custom processing
