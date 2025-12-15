# Plan - Publish as part of **renoirb/renoirb-esm-modules**

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

### Current Status

**✅ Complete:**

- Core implementation (`SleeveCalculator` + `DriftCalculator`)
- Comprehensive test suite (15 suites, 49 test steps, all passing)
- Type definitions and exports
- Documentation (CLAUDE.md, PACKAGE_CONTEXT.md)
- Code quality (lint clean, formatted, Deno 2.6.1 compliant)
- Interactive CLI tool (`deno.ts`)

**🔧 Remaining Work:**

- Create barrel file structure
- Update `deno.json` exports configuration
- Add JSR publishing metadata
- Update root monorepo imports
- Publish to JSR
- (Optional) Serve via dist.renoirb.com

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

**Phase 1 Complete When:**

- ✅ `deno.json` has JSR metadata (description, license, exports)
- ✅ Exports point to TypeScript source (`./src/index.ts`)
- ✅ LICENSE exists (monorepo root or package-level)
- ✅ README.md has usage examples

**Phase 2 Complete When:**

- ✅ `deno publish --dry-run` succeeds with no errors
- ✅ File list looks correct (no unwanted files)
- ✅ All tests still pass

**Phase 3 Complete When:**

- ✅ Package published to JSR successfully
- ✅ JSR page visible at `https://jsr.io/@renoirb/investing-sleeve-calculator`
- ✅ Can install via `deno add @renoirb/investing-sleeve-calculator`
- ✅ Import works in fresh Deno project
- ✅ Documentation auto-generated correctly

**Phase 4 Complete When (Optional):**

- ✅ Examined JSR's transpiled output
- ✅ Documented observations about transpilation
- ✅ Created `core.mjs` barrel file (if beneficial)
- ✅ Updated monorepo imports (if using barrel files)

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
