# Usage Example - Calculate Drift and Rebalance

This example demonstrates calculating drift between target and actual holdings, then generating rebalancing tasks for a single sleeve.

**Portfolio details and attribution:** See [`../src/sleeves.examples.ts`](../src/sleeves.examples.ts)

**Disclaimer:** This is example code for software demonstration only. Not financial advice.

---

## Scenario

**Account:** Alice's RRSP
**Total Allocated:** $24,000 CAD
**Exchange Rate:** 1.38 (CAD/USD)
**Date:** 2025-01-15
**Sleeve:** "core" (see [`../src/sleeves.examples.ts`](../src/sleeves.examples.ts) for weights)

---

## Complete Code Example

```typescript
import {
  SleeveCalculator,
  DriftCalculator,
} from '../src/index.ts'
import { SLEEVES_FIVE_FACTOR } from '../src/sleeves.examples.ts'

// Step 1: Create calculator with Five Factor Portfolio definition
const calculator = new SleeveCalculator(SLEEVES_FIVE_FACTOR)

// Step 2: Calculate targets for Alice's RRSP
const targets = calculator.calculate(
  'core',      // sleeve name
  24000,       // total allocation in CAD
  1.38,        // CAD/USD exchange rate
)

const { summary, ...restTargets } = targets
console.table(summary)
console.log('Target allocation:', restTargets)

// Step 3: Create drift calculator with targets
const drift = new DriftCalculator(targets)

// Step 4: Set current holdings (with realistic drift)
drift.setCurrentlyOwning('VUN', 7450)    // Overweight by $250
drift.setCurrentlyOwning('XIC', 6980)    // Underweight by $220
drift.setCurrentlyOwning('XEF', 3925)    // Overweight by $85
drift.setCurrentlyOwning('XEC', 1850)    // Underweight by $70
drift.setCurrentlyOwning('AVUV', 1680)   // Underweight (USD)
drift.setCurrentlyOwning('AVDV', 1095)   // Overweight (USD)

// Step 5: Generate rebalancing tasks
const tasks = drift.getTasks()

// Step 6: Display tasks grouped by action
console.log('\n=== Rebalancing Tasks for Alice RRSP ===\n')

// SELL first (frees up liquidity)
const sellTasks = tasks.filter(t => t.action === 'sell')
if (sellTasks.length > 0) {
  console.log('SELL (execute first to free liquidity):')
  for (const { symbol, from, to, delta, currency } of sellTasks) {
    console.log(
      `  ${symbol}: Sell ${Math.abs(delta).toFixed(2)} ${currency} ` +
      `(from ${from.toFixed(0)} → ${to.toFixed(0)})`
    )
  }
  console.log()
}

// BUY next (requires liquidity from sells)
const buyTasks = tasks.filter(t => t.action === 'buy')
if (buyTasks.length > 0) {
  console.log('BUY (execute after sells):')
  for (const { symbol, from, to, delta, currency } of buyTasks) {
    console.log(
      `  ${symbol}: Buy ${delta.toFixed(2)} ${currency} ` +
      `(from ${from.toFixed(0)} → ${to.toFixed(0)})`
    )
  }
  console.log()
}

// HOLD last (already balanced)
const holdTasks = tasks.filter(t => t.action === 'hold')
if (holdTasks.length > 0) {
  console.log('HOLD (already balanced):')
  for (const { symbol, from, currency } of holdTasks) {
    console.log(`  ${symbol}: ${from.toFixed(0)} ${currency}`)
  }
}

// Step 7: Save state for later (optional)
const savedState = drift.toJSON()
console.log('\nSaved state (for logging/reproduction):')
console.log(JSON.stringify(savedState, null, 2))

// Step 8: Restore from saved state later (optional)
const restoredDrift = DriftCalculator.fromJSON(savedState)
const sameTasks = restoredDrift.getTasks()
console.log('\nRestored drift calculator works identically')
```

---

## Expected Output

```
┌───────────────┬───────────────────┐
│ (idx)         │ Values            │
├───────────────┼───────────────────┤
│ totalCAD      │ 20160             │
│ totalUSD      │ 2782.608695652174 │
│ totalUSDInCAD │ 3840              │
└───────────────┴───────────────────┘

Target allocation: {
  sleeveName: "core",
  totalAmountCAD: 24000,
  exchangeRate: 1.38,
  targets: [
    { symbol: "AVDV", targetAmount: 1043.4782608695652, currency: "USD", weight:  6, normalizedWeight: 0.06 },
    { symbol: "AVUV", targetAmount: 1739.1304347826087, currency: "USD", weight: 10, normalizedWeight: 0.1 },
    { symbol: "VUN",  targetAmount: 7200,               currency: "CAD", weight: 30, normalizedWeight: 0.3 },
    { symbol: "XEC",  targetAmount: 1920,               currency: "CAD", weight:  8, normalizedWeight: 0.08 },
    { symbol: "XEF",  targetAmount: 3840,               currency: "CAD", weight: 16, normalizedWeight: 0.16 },
    { symbol: "XIC",  targetAmount: 7200,               currency: "CAD", weight: 30, normalizedWeight: 0.3 }
  ],
}

=== Rebalancing Tasks for Alice RRSP ===

SELL (execute first to free liquidity):
  AVDV: Sell 51.52 USD (from 1095 → 1043)
  VUN: Sell 250.00 CAD (from 7450 → 7200)
  XEF: Sell 85.00 CAD (from 3925 → 3840)

BUY (execute after sells):
  AVUV: Buy 59.13 USD (from 1680 → 1739)
  XEC: Buy 70.00 CAD (from 1850 → 1920)
  XIC: Buy 220.00 CAD (from 6980 → 7200)
```

### Saved State for Reproduction

The `DriftCalculator.toJSON()` method produces a serializable state that combines:

1. **`calculationResult`** - The target allocation from `SleeveCalculator.calculate()` (shown as "Target allocation" above)
2. **`actuals`** - The current holdings entered via `setCurrentlyOwning()` calls

This saved state can be copy-pasted and later restored using `DriftCalculator.fromJSON()` to reproduce the exact same analysis.

**Example saved state structure:**

```json
{
  "calculationResult": {
    "sleeveName": "core",
    // ... rest of target allocation as above ...
  },
  "actuals": {
    "VUN": 7450,
    "XIC": 6980,
    "XEF": 3925,
    "XEC": 1850,
    "AVUV": 1680,
    "AVDV": 1095
  }
}
```

---

## Running the Example

```bash
# Verify the example code works
deno test --doc examples/USAGE_EXAMPLE_CALCULATE_DRIFT.md

# For interactive rebalancing workflow, use the CLI tool:
deno task use:balance
# Uses built-in sleeves from ../src/sleeves.examples.ts (reproduces this example)

# Or provide custom sleeve configuration:
deno task use:balance /path/to/sleeves.yaml
```

---

## Key Workflow Steps

1. **Import sleeve definition** - Use existing `SLEEVES_FIVE_FACTOR` from examples
2. **Calculate targets** - `SleeveCalculator.calculate()` gives you target amounts
3. **Create drift analyzer** - Pass targets to `DriftCalculator`
4. **Set actuals** - Call `setCurrentlyOwning()` for each position
5. **Get tasks** - `getTasks()` returns buy/sell/hold recommendations
6. **Execute in order** - SELL → BUY → HOLD for proper liquidity management
7. **Save state** (optional) - `toJSON()` for logging/reproduction
8. **Restore state** (optional) - `fromJSON()` to continue later

---

## Drift Analysis

| Security | Target (CAD) | Actual (CAD) | Drift | Action |
|----------|--------------|--------------|-------|--------|
| VUN | $7,200 | $7,450 | +$250 | SELL |
| XIC | $7,200 | $6,980 | -$220 | BUY |
| XEF | $3,840 | $3,925 | +$85 | SELL |
| XEC | $1,920 | $1,850 | -$70 | BUY |
| AVUV | $2,400 | $2,318 | -$82 | BUY |
| AVDV | $1,440 | $1,511 | +$71 | SELL |

**Total drift:** ~$700 CAD across all positions (2.9% of portfolio)

---

## Rebalancing Considerations

### Task Ordering
- **SELL first** - Frees up cash for purchases
- **BUY second** - Uses freed capital
- **HOLD** - No action needed

### Transaction Costs
- Small drift amounts (<$100) may not justify commission fees
- Consider minimum trade thresholds (e.g., only rebalance if drift >$200)
- Alternative: direct new contributions to underweight positions

### Frequency
- Quarterly rebalancing typical for buy-and-hold investors
- Annual rebalancing minimizes transaction costs
- Threshold-based rebalancing (e.g., when any position drifts >5%)

---

## References

- **Portfolio Attribution:** [`../src/sleeves.examples.ts`](../src/sleeves.examples.ts)
- **Calculator Documentation:** [`../README.md`](../README.md)

---

## Related Examples

- [`historical-data/20250115/Alice-RRSP.json`](historical-data/20250115/Alice-RRSP.json) - Sample brokerage snapshot
- [`historical-data/20250115/allocation.yaml`](historical-data/20250115/allocation.yaml) - Target allocations
- Interactive CLI: `deno run --allow-read ../deno.ts`
