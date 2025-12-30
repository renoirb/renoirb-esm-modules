# Refactoring Plan: `./src/` Directory

## Status

⏸️ **ON HOLD** - Waiting for cross-runtime module architecture finalization

**Blocker:** Need to establish file naming conventions and cross-runtime patterns for the `@renoirb/` ESM modules monorepo.

**Context Required:**
- [[Professional Development ESM Module Distribution System]]
- [[Professional Development Cross Runtime Module Architecture]]
- [[README For Renoir ESM Modules]]

**Current Issue:** File naming conventions (e.g., `./deno.ts` for runtime-specific code) and cross-runtime compatibility patterns need to be standardized across the monorepo before refactoring individual packages.

**Testing Note:** Current Deno tests are working. During cross-runtime refactor, will need to ensure proper testing infrastructure for each target runtime (browser-specific tests in browser, etc.).

---

## Summary

Refactor the `./src/` directory to align with coding preferences focusing on:

- Maps as source of truth for type validation
- Extracted constants for magic numbers
- Assertion functions for validation
- Consistent formatting (one action per line, trailing commas)
- **Cross-runtime compatibility** (Deno, Node, Browser, Bun)

**Scope:** High-priority items only
**Compatibility:** Preserve all existing exports and public API
**Tests:** Ensure tests pass after each refactoring step

---

## Prerequisites

### Establish Cross-Runtime Architecture First

**Action Required:**

- Finalize file naming conventions for runtime-specific code
- Document cross-runtime patterns and conventions
- Establish testing strategy across runtimes (Deno, Node, Browser, Bun)
- See context notes listed in Status section above

**Once architecture is established, proceed with refactoring steps below.**

---

## Critical Files to Modify

1. `src/types.ts` - Add Maps as source of truth for CurrencyCode and DriftAction
2. `src/calculator.ts` - Extract constants, refactor validation, improve formatting
3. `src/drift.ts` - Extract constants, improve formatting
4. `src/index.ts` - Improve export formatting consistency

---

## Implementation Steps

### Step 1: Add Map-based Source of Truth for Types

**File:** `src/types.ts`

**Changes:**

1. Create private `_VALID_CURRENCIES` Map before the CurrencyCode type
2. Create private `_VALID_ACTIONS` Map before the DriftAction type
3. Add assertion functions: `assertIsCurrencyCode` and `assertIsDriftAction`
4. Add getter functions: `getValidCurrencies()` and `getValidActions()`
5. Export assertion functions and getters (not the private Maps)

**Why:**

- Establishes single source of truth for valid values
- Enables runtime validation with clear error messages
- Prevents typos and invalid values
- Easy to extend with metadata (labels, descriptions, etc.)

**Example pattern:**

```typescript
// Private Map - not exported
const _VALID_CURRENCIES = new Map<string, string>([
  ['CAD', 'Canadian Dollar'],
  ['USD', 'US Dollar'],
])

// Type derived from Map keys
export type CurrencyCode = 'CAD' | 'USD'

// Assertion function
export const assertIsCurrencyCode = (
  value: unknown,
): asserts value is CurrencyCode => {
  if (typeof value !== 'string' || !_VALID_CURRENCIES.has(value)) {
    const valid = [..._VALID_CURRENCIES.keys()].join(', ')
    const message = `Invalid currency: ${value}. Valid options: ${valid}`
    throw new Error(message)
  }
}

// Controlled access
export const getValidCurrencies = (): ReadonlyMap<string, string> => {
  return new Map(_VALID_CURRENCIES)
}
```

**Backward Compatibility:** ✓ No breaking changes - types remain the same, new exports are additive

---

### Step 2: Extract Constants in calculator.ts

**File:** `src/calculator.ts`

**Changes:**

1. Add constant at top of file (after imports):
   ```typescript
   /**
    * Minimum weight threshold for active positions
    * Weights below this are considered "watching" positions and excluded from allocation
    */
   const MIN_ACTIVE_WEIGHT = 0.1
   ```

2. Add constant:
   ```typescript
   /**
    * Tolerance for weight sum validation
    * Allows for rounding differences of ±0.1%
    */
   const WEIGHT_SUM_TOLERANCE = 0.1
   ```

3. Replace magic numbers with these constants:
   - Line 54: `.filter(([_, weight]) => weight >= MIN_ACTIVE_WEIGHT)`
   - Line 171: `const activeWeights = weights.filter((w) => w >= MIN_ACTIVE_WEIGHT);`
   - Line 175: `if (Math.abs(totalWeight - 100) > WEIGHT_SUM_TOLERANCE) {`

**Why:**

- Eliminates magic numbers scattered throughout code
- Single source of truth for business rules
- Easier to adjust thresholds in one place
- Makes intent clear through naming

**Backward Compatibility:** ✓ Internal constant extraction, no API changes

---

### Step 3: Extract Constants in drift.ts

**File:** `src/drift.ts`

**Changes:**

1. Add constant at top of file (after imports):
   ```typescript
   /**
    * Threshold for considering a position balanced
    * Deltas within this amount (in native currency) are treated as "hold"
    */
   const ACTION_THRESHOLD_CENTS = 0.01
   ```

2. Replace hardcoded value on line 81:
   ```typescript
   if (Math.abs(delta) < ACTION_THRESHOLD_CENTS) {
     // Within threshold - consider it balanced
     action = 'hold'
   }
   ```

**Why:**

- Removes magic number from action determination logic
- Makes threshold tunable in one location
- Clarifies business rule (within 1 cent = balanced)

**Backward Compatibility:** ✓ Internal constant extraction, no API changes

---

### Step 4: Refactor Validation into Assertion Functions

**File:** `src/calculator.ts`

**Changes:**

1. Extract assertion functions before the SleeveCalculator class:

```typescript
/**
 * Validates that a total amount is a positive number
 * @throws {Error} If amount is invalid
 */
const assertValidTotalAmount = (
  amount: number,
): asserts amount is number => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    const message = `Total amount must be a number, got: ${amount}`
    throw new Error(message)
  }

  if (amount <= 0) {
    const message = `Total amount must be greater than 0, got: ${amount}`
    throw new Error(message)
  }
}

/**
 * Validates that an exchange rate is a positive number
 * @throws {Error} If rate is invalid
 */
const assertValidExchangeRate = (
  rate: number,
): asserts rate is number => {
  if (typeof rate !== 'number' || isNaN(rate)) {
    const message = `Exchange rate must be a number, got: ${rate}`
    throw new Error(message)
  }

  if (rate <= 0) {
    const message = `Exchange rate must be greater than 0, got: ${rate}`
    throw new Error(message)
  }
}

/**
 * Validates that a weight is a non-negative number
 * @throws {Error} If weight is invalid
 */
const assertValidWeight = (
  symbol: string,
  weight: number,
  sleeveName: string,
): asserts weight is number => {
  if (typeof weight !== 'number' || isNaN(weight)) {
    const message =
      `Sleeve "${sleeveName}" has invalid weight for ${symbol}: ${weight}`
    throw new Error(message)
  }

  if (weight < 0) {
    const message =
      `Sleeve "${sleeveName}" has negative weight for ${symbol}: ${weight}`
    throw new Error(message)
  }
}
```

2. Refactor `validateCalculateParams` (lines 202-229) to use assertions:

```typescript ignore
private validateCalculateParams(
  sleeveName: string,
  totalAmountCAD: number,
  exchangeRate: number,
): void {
  if (!this.hasSleeve(sleeveName)) {
    const available = this.getSleeveNames().join(', ');
    throw new Error(
      `Sleeve "${sleeveName}" not found. Available: ${available}`,
    );
  }

  assertValidTotalAmount(totalAmountCAD);
  assertValidExchangeRate(exchangeRate);
}
```

3. Refactor `validateSleeve` weight validation loop (lines 157-168) to use `assertValidWeight`:

```typescript
// Check that weights are numbers
for (const [symbol, weight] of Object.entries(sleeve.weights)) {
  assertValidWeight(
    symbol,
    weight,
    sleeveName,
  )
}
```

**Why:**

- Reusable validation logic
- Consistent error message formatting
- Testable in isolation (future benefit)
- Follows assertion function pattern preference

**Backward Compatibility:** ✓ Same validation logic, just reorganized

---

### Step 5: Formatting Improvements

**Files:** `src/calculator.ts`, `src/drift.ts`, `src/index.ts`

**Changes:**

#### src/calculator.ts

- Ensure imports have trailing commas:
  ```typescript
  import type {
    CalculationResult,
    CurrencyCode,
    SecurityTarget,
    SleeveDefinition,
    SleevesConfig,
  } from './types.ts'
  ```

- Format function parameters with trailing comma:
  ```typescript ignore
  calculate(
    sleeveName: string,
    totalAmountCAD: number,
    exchangeRate: number,
  ): CalculationResult {
  ```

#### src/drift.ts

- Format Map initialization across multiple lines:
  ```typescript ignore
  this.targetsMap = new Map(
    calculationResult.targets.map((target) => [
      target.symbol,
      target,
    ]),
  )
  ```

- Ensure imports have trailing commas:
  ```typescript ignore
  import type {
    CalculationResult,
    DeltaResult,
    DriftAction,
    DriftCalculatorState,
    SecurityTarget,
  } from './types.ts'
  ```

#### src/index.ts

- Ensure consistent formatting with trailing commas:
  ```typescript ignore
  export type {
    CalculationResult,
    CurrencyCode,
    DeltaResult,
    DriftAction,
    DriftCalculatorState,
    SecurityTarget,
    SleeveDefinition,
    SleevesConfig,
    SleeveWeights,
  } from './types.ts'
  ```

**Why:**

- Aligns with "one action per line, trailing commas" preference
- Easier to see changes in git diffs
- Reduces cognitive load when scanning code
- Consistent with working memory accommodation needs

**Backward Compatibility:** ✓ Pure formatting changes, no functional differences

---

## Execution Order

Execute steps in this specific order to minimize risk:

1. **Step 0** (Prerequisites) - Fix test infrastructure first
2. **Step 1** (types.ts) - Foundation for validation, no dependencies
3. **Step 2** (calculator.ts constants) - Simple extraction, isolated
4. **Step 3** (drift.ts constants) - Simple extraction, isolated
5. **Step 4** (calculator.ts assertions) - Uses constants from Step 2
6. **Step 5** (formatting) - Final polish, no functional changes

After each step:

- Run tests: `deno test`
- Verify all tests pass before proceeding
- Git commit with descriptive message

---

## Verification Checklist

After completing all steps:

- [ ] Test infrastructure working (`deno test` runs)
- [ ] All existing tests pass
- [ ] No changes to test files (unless required to fix infrastructure)
- [ ] All existing type exports still available
- [ ] Public API unchanged (SleeveCalculator, DriftCalculator methods)
- [ ] Example file still runs without errors (`deno run --allow-read src/example.ts`)
- [ ] No new dependencies added
- [ ] Code follows formatting preferences (one action/line, trailing commas)

---

## Deferred Items (Medium/Low Priority)

These are NOT included in this refactoring but noted for future consideration:

- Extract pure function `calculateCurrencyTotals(targets, currency)`
- Extract pure function `createSecurityTarget(...)`
- Add helper method `getTarget(symbol)` to CalculationResult
- Refactor example.ts to reduce repetition
- Break nested chains into intermediate variables
- Add tests for new assertion functions
- Create drift.test.ts for DriftCalculator

---

## Risk Assessment

**Risk Level:** LOW

- All changes are internal refactoring
- Public API completely preserved
- Existing tests validate behavior (once working)
- Changes are additive (new constants, new functions)
- No dependency changes

**Mitigation:**

- Fix tests before starting refactoring
- Run tests after each step
- Commit after each successful step for easy rollback
- Keep changes focused and incremental
