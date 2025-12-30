# Feature Plan: USD Input for USD-Only Sleeves

## Summary

Add explicit `inputCurrency` parameter to `calculate()` method to support direct USD input for USD-only sleeves, eliminating unnecessary CAD→USD conversion.

## Problem

Currently, `SleeveCalculator.calculate()` always assumes CAD input, even for USD-only sleeves like `core-USD`. This forces awkward conversion:

```typescript
// Awkward: I have $10,000 USD to allocate, but must think in CAD
calculator.calculate('core-USD', 14200, 1.42)  // 10000 USD × 1.42 = 14200 CAD
```

For sleeves where **all securities are USD-denominated**, this adds cognitive overhead and potential errors.

## Proposed Solution

Add explicit `inputCurrency` parameter with `'CAD'` as default (backward compatible):

```typescript ignore
calculate(
  sleeveName: string,
  amount: number,
  exchangeRate: number,
  inputCurrency?: 'CAD' | 'USD'  // defaults to 'CAD'
): CalculationResult
```

### Usage Examples

**USD-only sleeve with USD input:**
```typescript
// Direct: I have $10,000 USD to allocate
calculator.calculate('core-USD', 10000, 1.42, 'USD')
// No conversion needed - allocates 10000 USD directly
```

**Mixed CAD/USD sleeve with CAD input (default):**
```typescript
// I have $5,000 CAD to allocate
calculator.calculate('core', 5000, 1.42)
// or explicitly:
calculator.calculate('core', 5000, 1.42, 'CAD')
```

**Mixed sleeve with USD input:**
```typescript
// I have $3,000 USD to allocate
calculator.calculate('core', 3000, 1.42, 'USD')
// Converts USD to CAD first: 3000 × 1.42 = 4260 CAD
// Then allocates as normal
```

## Implementation Details

### Algorithm Changes

**When `inputCurrency === 'USD'`:**

1. **For CAD securities:**
   - Convert USD input to CAD: `cadAmount = usdAmount × exchangeRate`
   - Calculate target: `targetAmount = cadAmount × weight%`
   - Currency: `'CAD'`

2. **For USD securities:**
   - No conversion needed
   - Calculate target: `targetAmount = usdAmount × weight%`
   - Currency: `'USD'`

3. **Summary totals:**
   - `totalUSD` = sum of all USD targets
   - `totalCAD` = sum of all CAD targets
   - `totalUSDInCAD` = `totalUSD × exchangeRate`
   - `totalCADInUSD` = `totalCAD / exchangeRate`

**When `inputCurrency === 'CAD'` (default):**
- Current behavior (unchanged)

### Type Changes

```typescript
// types.ts
export interface CalculationResult {
  sleeveName: string
  totalAmountCAD: number
  totalAmountUSD: number        // NEW: original input when inputCurrency=USD
  inputCurrency: 'CAD' | 'USD'  // NEW: track which currency was input
  exchangeRate: number
  targets: TargetAllocation[]
  summary: AllocationSummary
}
```

### Backward Compatibility

**Fully backward compatible** - existing code continues to work:
```typescript
// Old code (still works)
calculator.calculate('core', 5000, 1.42)
// Equivalent to:
calculator.calculate('core', 5000, 1.42, 'CAD')
```

## Benefits

1. **Intuitive for USD investors** - No mental conversion required
2. **Reduces errors** - Direct input matches how you think about the allocation
3. **Explicit** - No hidden "detection" logic that could cause bugs
4. **Flexible** - Works for any sleeve configuration

## Why Option B (Explicit Parameter) Over Auto-Detection

**Rejected: Auto-detection based on sleeve composition**
```typescript
// BAD: Hidden logic leads to surprises
if (allSecuritiesAreUSD(sleeve)) {
  // Assume USD input
}
```

**Problems with auto-detection:**
- Hidden behavior - not obvious from function signature
- Can break when sleeve config changes
- Difficult to override when needed
- "Detection bugs" when we've forgotten about the logic

**Explicit parameter is better:**
- ✅ Clear intent in code
- ✅ No surprises
- ✅ Easy to understand and maintain
- ✅ Compiler-enforced correctness

## Testing Strategy

### New Test Cases

1. **USD-only sleeve with USD input:**
   - Verify no conversion applied to targets
   - Verify summary totals correct

2. **Mixed sleeve with USD input:**
   - Verify CAD securities converted correctly
   - Verify USD securities allocated directly
   - Verify summary totals match

3. **Edge case: USD input with CAD-only sleeve:**
   - Should work (converts USD → CAD for all targets)

4. **Backward compatibility:**
   - Existing tests should pass without changes
   - Default behavior unchanged

### Test Refactoring Needed

- Update existing `core-USD` tests to use `inputCurrency: 'USD'`
- Add parallel tests for USD input mode
- Verify CLI tool integration

## CLI Tool Integration

The interactive CLI (`deno.ts`) should prompt for input currency.



## Migration Path

1. ✅ **Phase 1:** Create this plan document (CURRENT)
2. **Phase 2:** Update `types.ts` - add optional parameter
3. **Phase 3:** Update `calculator.ts` - implement logic
4. **Phase 4:** Add new test cases
5. **Phase 5:** Update CLI tool
6. **Phase 6:** Update documentation and examples

## Related Files

- `src/calculator.ts` - Core implementation
- `src/types.ts` - Type definitions
- `src/calculator.test.ts` - Test suite
- `deno.ts` - CLI tool
- `PACKAGE_CONTEXT.md` - Design decisions
- `README.md` - User documentation

## Open Questions

1. Should `totalAmountCAD` and `totalAmountUSD` both be included in result?
   - Or rename to `totalAmountInput` and include `inputCurrency`?

2. Should we validate that `exchangeRate > 0` is actually needed?
   - For USD input with USD-only sleeve, rate isn't used

3. Should summary include both `totalCADInUSD` and `totalUSDInCAD`?
   - Or just one direction based on input currency?

## Notes

- This feature was discovered during test refactoring when fixing hardcoded values
- Explicit parameter chosen over auto-detection to prevent "forgotten detection logic" bugs
- Maintains backward compatibility - all existing code continues to work
