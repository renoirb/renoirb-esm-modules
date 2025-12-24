# Usage Example - Calculate Drift and Rebalance

This example demonstrates calculating drift between target and actual holdings, then generating rebalancing tasks for a single sleeve.

## Attribution

Portfolio composition based on the **Five Factor Investing with ETFs** model by Benjamin Felix, Portfolio Manager at PWL Capital.

**Source:** [Rational Reminder Podcast Episode 129](https://rationalreminder.ca/podcast/129) (December 17, 2020)

**Disclaimer:** This is example code for software demonstration only. Not financial advice.

---

## Scenario

**Account:** Alice's RRSP
**Total Allocated:** $24,000 CAD
**Exchange Rate:** 1.38 (CAD/USD)
**Date:** 2025-01-15

### Five Factor Portfolio Target Weights

- AVDV 6% - Avantis International Small Cap Value ETF (USD)
- AVUV 10% - Avantis U.S. Small Cap Value ETF (USD)
- VUN 30% - Vanguard U.S. Total Market Index ETF (CAD)
- XEC 8% - iShares Core MSCI Emerging Markets IMI Index ETF (CAD)
- XEF 16% - iShares Core MSCI EAFE IMI Index ETF (CAD)
- XIC 30% - BMO S&P/TSX Capped Composite Index ETF (CAD)

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

console.log('Target allocation:', targets)
console.log('Summary:', targets.summary)

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
Target allocation: {
  sleeveName: 'core',
  totalAmountCAD: 24000,
  exchangeRate: 1.38,
  targets: [
    { symbol: 'VUN', targetAmount: 7200, currency: 'CAD', weight: 30, normalizedWeight: 0.3 },
    { symbol: 'XIC', targetAmount: 7200, currency: 'CAD', weight: 30, normalizedWeight: 0.3 },
    { symbol: 'XEF', targetAmount: 3840, currency: 'CAD', weight: 16, normalizedWeight: 0.16 },
    { symbol: 'XEC', targetAmount: 1920, currency: 'CAD', weight: 8, normalizedWeight: 0.08 },
    { symbol: 'AVUV', targetAmount: 1739.13, currency: 'USD', weight: 10, normalizedWeight: 0.1 },
    { symbol: 'AVDV', targetAmount: 1043.48, currency: 'USD', weight: 6, normalizedWeight: 0.06 }
  ],
  summary: { totalCAD: 19200, totalUSD: 2782.61, totalUSDInCAD: 3840 }
}

=== Rebalancing Tasks for Alice RRSP ===

SELL (execute first to free liquidity):
  VUN: Sell 250.00 CAD (from 7450 → 7200)
  XEF: Sell 85.00 CAD (from 3925 → 3840)
  AVDV: Sell 51.52 USD (from 1095 → 1043)

BUY (execute after sells):
  XIC: Buy 220.00 CAD (from 6980 → 7200)
  XEC: Buy 70.00 CAD (from 1850 → 1920)
  AVUV: Buy 59.13 USD (from 1680 → 1739)
```

---

## Running the Example

```bash
# From the package root directory
deno run examples/USAGE_EXAMPLE_DRIFT_CALCULATOR.md

# Or copy the code to a .ts file and run it
deno run example-workflow.ts
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

- **Five Factor Portfolio:** [Rational Reminder Podcast Episode 129](https://rationalreminder.ca/podcast/129)
- **Sleeve Examples:** [`../src/sleeves.examples.ts`](../src/sleeves.examples.ts)
- **Calculator Documentation:** [`../README.md`](../README.md)
- **Rational Reminder Podcast:** <https://rationalreminder.ca/>

---

## Related Examples

- [`historical-data/20250115/Alice-RRSP.json`](historical-data/20250115/Alice-RRSP.json) - Sample brokerage snapshot
- [`historical-data/20250115/allocation.yaml`](historical-data/20250115/allocation.yaml) - Target allocations
- Interactive CLI: `deno run --allow-read ../deno.ts`
