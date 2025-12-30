# @renoirb/investing-sleeve-calculator

Pure TypeScript calculation engine for portfolio sleeve allocation and drift analysis. Designed for Canadian investors managing multi-currency portfolios (CAD/USD).

[![JSR](https://jsr.io/badges/@renoirb/investing-sleeve-calculator)](https://jsr.io/@renoirb/investing-sleeve-calculator)
[![JSR Score](https://jsr.io/badges/@renoirb/investing-sleeve-calculator/score)](https://jsr.io/@renoirb/investing-sleeve-calculator)

## Features

- **Sleeve Allocation**: Calculate target amounts for securities based on percentage weights
- **Multi-Currency**: Automatic CAD/USD conversion for Canadian investors
- **Drift Analysis**: Compare target vs actual holdings
- **Rebalancing Tasks**: Generate buy/sell/hold recommendations
- **Pure Calculation Library**: No external dependencies, works in any runtime
- **Type Safe**: Full TypeScript support with comprehensive type definitions

## Why This Tool

Building and maintaining a balanced portfolio requires repeated ratio calculations every time you rebalance or add new funds. This tool was created to help individual investors—particularly those learning about portfolio management—understand and perform the systematic work that financial advisors and portfolio managers do.

**About Fiduciary Duty:**

When learning about investing, one important concept is "fiduciary duty"—a legal obligation for advisors to act in your best interest, putting your needs ahead of their own financial gain. Understanding this helps you decide whether to work with advisors or manage your own portfolio.

This calculator provides the mathematical foundation for either path: it helps you implement rigorous portfolio management yourself, or understand what your advisor should be doing for you.

**What This Tool Does:**

For a portfolio with target percentage allocations (e.g., 30% Canadian equities, 30% U.S. equities, etc.), this tool calculates exactly how much money should go into each security, handles currency conversions, and identifies what to buy or sell to maintain your target balance.

This tool is designed to help you:
- **Manage your whole portfolio** - Track risk-bearing positions in their sleeves alongside unallocated cash reserves
- **Stay calm during market drawdowns** - Having unallocated funds ready and a systematic rebalancing plan reduces nervousness when markets drop
- **Execute dollar-cost averaging** - Calculate exact amounts for regular contributions across multiple securities
- **Organize by purpose** - Different sleeves for different goals (e.g., core equity, precious metals, income)

**Important Note on Costs:**
When selecting ETFs or securities for your portfolio, always verify their fees. For example, a Management Expense Ratio (MER) of 0.06% costs $6/year per $10,000 invested, while 0.50% MER costs $50/year on the same amount. Small differences compound significantly over decades. Be mindful of costs when building your portfolio.

As a programmer, I built this to help me understand these calculations deeply and manage my own investments systematically.

## Installation

### Deno

```typescript
import {
  SleeveCalculator,
  DriftCalculator,
} from 'jsr:@renoirb/investing-sleeve-calculator@^0.1.1'
```

Or add to your `deno.json`:

```json
{
  "imports": {
    "@renoirb/investing-sleeve-calculator": "jsr:@renoirb/investing-sleeve-calculator@^0.1.1"
  }
}
```

### Browser (ESM via CDN)

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
  // Use the calculator...
</script>
```

## Quick Start

### Calculate Sleeve Targets

```typescript
import {
  SleeveCalculator,
  type SleevesConfig,
  } from '@renoirb/investing-sleeve-calculator'

// Define your sleeve configuration
const config: SleevesConfig = {
  sleeves: {
    bullion: {
      weights: {
        PHYS: 50,
        PSLV: 50,
      },
    },
  },
}

// Create calculator
const calculator = new SleeveCalculator(config)

// Calculate targets for $10,000 CAD at 1.42 exchange rate
const calcResult = calculator.calculate('bullion', 10000, 1.42)

console.log(calcResult.targets)
// [
//   { symbol: 'PHYS', targetAmount: 5000, currency: 'CAD', weight: 50, normalizedWeight: 0.5 },
//   { symbol: 'PSLV', targetAmount: 5000, currency: 'CAD', weight: 50, normalizedWeight: 0.5 },
// ]
```

### Analyze Drift and Generate Rebalancing Tasks

```typescript
import { 
  DriftCalculator,
  type CalculationResult
} from '@renoirb/investing-sleeve-calculator'

const calcResult = {
  sleeveName: "bullion",
  totalAmountCAD: 10000,
  exchangeRate: 1.42,
  targets: [
    {
      symbol: "PHYS",
      targetAmount: 5000,
      currency: "CAD",
      weight: 50,
      normalizedWeight: 0.5
    },
    {
      symbol: "PSLV",
      targetAmount: 5000,
      currency: "CAD",
      weight: 50,
      normalizedWeight: 0.5
    }
  ]
} as CalculationResult

// Use calculation result from above
const drift = new DriftCalculator(calcResult)

// Set current holdings
drift.setCurrentlyOwning('PHYS', 4800)
drift.setCurrentlyOwning('PSLV', 5000)

// Get rebalancing tasks
const tasks = drift.getTasks()

console.log(tasks)
// [
//   {
//     symbol: "PHYS",
//     from: 4800,
//     to: 5000,
//     delta: 200,
//     action: "buy",
//     currency: "CAD"
//   }
// ]
```

## API Reference

### SleeveCalculator

#### Constructor

```typescript ignore
new SleeveCalculator(config: SleevesConfig)
```

Creates a calculator with your sleeve definitions. Validates that all sleeve weights sum to ~100%.

**Parameters:**
- `config`: Sleeve configuration object

**Throws:**
- `Error` if configuration is invalid (missing weights, weights don't sum to 100%, etc.)

#### calculate()

```typescript ignore
calculate(
  sleeveName: string,
  totalAmountCAD: number,
  exchangeRate: number,
): CalculationResult
```

Calculates target amounts for each security in a sleeve.

**Parameters:**
- `sleeveName`: Name of the sleeve to calculate
- `totalAmountCAD`: Total allocation amount in CAD
- `exchangeRate`: CAD/USD exchange rate (e.g., 1.42 means 1 USD = 1.42 CAD)

**Returns:** `CalculationResult` with targets and summary

**Throws:**
- `Error` if sleeve not found or parameters invalid

#### getSleeveNames()

```typescript ignore
getSleeveNames(): string[]
```

Returns array of available sleeve names.

#### hasSleeve()

```typescript ignore
hasSleeve(sleeveName: string): boolean
```

Checks if a sleeve exists in the configuration.

### DriftCalculator

#### Constructor

```typescript ignore
new DriftCalculator(calculationResult: CalculationResult)
```

Creates a drift calculator from a calculation result.

**Parameters:**
- `calculationResult`: Result from `SleeveCalculator.calculate()`

#### setCurrentlyOwning()

```typescript ignore
setCurrentlyOwning(symbol: string, amount: number): void
```

Sets the current holding amount for a security.

**Parameters:**
- `symbol`: Security symbol
- `amount`: Current holding amount (in security's native currency)

**Throws:**
- `Error` if symbol not found in targets

#### getDelta()

```typescript ignore
getDelta(symbol: string): DeltaResult | null
```

Gets the drift (difference between target and actual) for a specific security.

**Returns:** `DeltaResult` object or `null` if symbol not found

#### getTasks()

```typescript ignore
getTasks(): DeltaResult[]
```

Gets rebalancing tasks for all securities (includes 'hold' actions).

#### getActionableTasks()

```typescript ignore
getActionableTasks(): DeltaResult[]
```

Gets only actionable rebalancing tasks (excludes 'hold' actions).

#### toJSON() / fromJSON()

```typescript ignore
toJSON(): DriftCalculatorState
static fromJSON(state: DriftCalculatorState): DriftCalculator
```

Serializes/deserializes calculator state for persistence or transmission.

#### clearActuals()

```typescript ignore
clearActuals(): void
```

Clears all current holdings (resets to zero).

## Type Definitions

### SleevesConfig

```typescript ignore
interface SleevesConfig {
  sleeves: {
    [sleeveName: string]: {
      weights: {
        [symbol: string]: number  // Percentage weights (e.g., 50 for 50%)
      }
      usd_symbols?: string[]     // Optional: symbols that trade in USD
    }
  }
}
```

### CalculationResult

```typescript
import { type SecurityTarget } from '@renoirb/investing-sleeve-calculator'

interface CalculationResult {
  sleeveName: string
  totalAmountCAD: number
  exchangeRate: number
  targets: SecurityTarget[]
  summary: {
    totalCAD: number
    totalUSD: number
    totalUSDInCAD: number
  }
}
```

### SecurityTarget

```typescript
interface SecurityTarget {
  symbol: string
  targetAmount: number        // In security's native currency
  currency: 'CAD' | 'USD'
  weight: number              // Original weight percentage
  normalizedWeight: number    // Decimal form (0-1)
}
```

### DeltaResult

```typescript
interface DeltaResult {
  symbol: string
  from: number                // Current holding
  to: number                  // Target amount
  delta: number               // Difference (positive = buy, negative = sell)
  action: 'buy' | 'sell' | 'hold'
  currency: 'CAD' | 'USD'
}
```

## Interactive CLI Tool

The package includes an interactive CLI for manual rebalancing workflows:

```bash
# Using Deno
deno --allow-read jsr:@renoirb/investing-sleeve-calculator@^0.1.1/deno

# Or from source
deno task cli

# With custom sleeves.yaml
deno --allow-read deno.ts /path/to/sleeves.yaml
```

**CLI Features:**
- Interactive prompts for sleeve selection, amount, and exchange rate
- Iterative input of current holdings
- Formatted rebalancing task output (SELL → BUY → HOLD)
- JSON state output for logging/reproduction

## Use Cases

1. **Portfolio Rebalancing**: Calculate how much to buy/sell to maintain target allocations
2. **DCA Planning**: Determine target amounts for dollar-cost averaging contributions
3. **Multi-Account Management**: Calculate targets for different account sleeves
4. **Reporting**: Generate allocation breakdowns and drift analysis reports
5. **Automation**: Integrate with trading APIs or portfolio management systems

## Design Principles

- **Pure Calculation Engine**: No file I/O, database, or external dependencies
- **Stateless**: Each calculation is independent
- **Currency Aware**: Proper handling of CAD/USD conversions
- **Validation First**: Clear error messages for invalid inputs
- **Type Safe**: Comprehensive TypeScript types throughout

## What It Doesn't Do

- Track actual holdings persistently (that's your database)
- Connect to brokerages or market data APIs
- Store allocation decisions or history
- Handle multi-currency inputs (assumes CAD in, converts USD out)

## Documentation

- **[PACKAGE_CONTEXT.md](./PACKAGE_CONTEXT.md)** - Comprehensive design decisions and algorithms
- **[CLAUDE.md](./CLAUDE.md)** - Project context and development guide
- **[API Documentation](https://jsr.io/@renoirb/investing-sleeve-calculator/doc)** - Full API reference on JSR

## Examples

See `src/sleeves.examples.ts` for example sleeve configurations including:
- Core equity sleeves (CAD and USD variants)
- Bullion/precious metals allocations
- Mixed currency portfolios

## Requirements

- **Deno**: 1.0.0 or higher
- **Node.js**: 18.0.0 or higher (with ESM support)
- **Browser**: Modern browsers with ESM support

## Testing

```bash
# Run all tests
deno test

# Run with coverage
deno test --coverage
```

**Test Coverage:**
- 15 test suites
- 49 test steps
- Core calculations, edge cases, serialization, real-world scenarios

## License

MIT License - see [LICENSE](../../LICENSE) for details

## Contributing

This package is part of the [renoirb-esm-modules](https://github.com/renoirb/renoirb-esm-modules) monorepo.

## Links

- **JSR Package**: <https://jsr.io/@renoirb/investing-sleeve-calculator>
- **Source Code**: <https://github.com/renoirb/renoirb-esm-modules/tree/main/packages/investing-sleeve-calculator>

## Author

Renoir Boulanger

---

**Note:** This is a pure calculation library designed for portfolio management systems. It does not provide investment advice. Always consult with qualified financial advisors for investment decisions.
