# Package Context - Sleeve Calculator

A standalone, pure TypeScript calculation engine for portfolio sleeve target amount calculations with USD/CAD currency conversion. Designed to be imported by portfolio management systems.

## Purpose

This is a **pure calculation utility** - not a tracking system or database.

**Given:**

- A sleeve definition (securities + their percentage weights)
- A total amount in CAD
- A USD/CAD exchange rate

**Calculate:**

- How much should be in each security (in its native currency)
- Percentage breakdown
- CAD/USD totals

**Key Assumption:** Designed for Canadian investors

- CAD is the default currency for all securities
- `usd_symbols` array explicitly marks exceptions (securities traded in USD)
- All input amounts are in CAD; USD positions are calculated via conversion

This enables answering questions like:

- "For 5K CAD in the core sleeve, how much should each security be?"
- "How much AVDV (USD) should there be in a 5K CAD core allocation?"
- "If I have two core allocations (5K + 70K), what's my total AVDV target?"

## Non-Goals

This calculator intentionally does NOT:

- Track actual holdings or positions
- Know about people, accounts, or brokerages
- Store allocation decisions (that's in `allocations.yaml`)
- Compare targets vs actuals (that's the drift calculator)
- Handle multi-currency input amounts (assumes CAD in, converts USD out)

It's a single-purpose math utility: **sleeve + amount + rate → breakdown**

## Package Positioning

This is a **standalone calculation library** designed to be imported by portfolio management systems.

**Key Characteristics:**

- Zero dependencies (Deno standard library only)
- Self-contained with example data for testing
- No file I/O requirements (pure functions)
- Can be used in Deno, Node, or browser environments

**Relationship to Parent Portfolio System:**

- Parent system imports this package for sleeve calculations
- This package does NOT depend on parent system files
- Production systems provide their own sleeve configurations
- CLI tool accepts optional path to custom sleeves.yaml for flexibility

## Design Decisions

### Constructor Pattern

The calculator is instantiated once with the full sleeves configuration:

```typescript ignore
const parsedSleevesObj: SleevesConfig = {
  sleeves: {
    bullion: {
      PHYS: 60,
      PSLV: 40,
    },
  },
}

const calculator = new SleeveCalculator(parsedSleevesObj)
```

**Constructor responsibilities:**

- Validate that all sleeves have weights summing to ~100% (within tolerance)
- Normalize sleeve names (keys)
- Store configuration for repeated calculations
- Fail early with clear validation errors

### Calculation Method

**OPEN QUESTION:** The `calculate()` signature needs clarification.

**Option A - Simple positional parameters:**

```typescript ignore
const calcResult = calculator.calculate('core', 5000, 1.40)
// sleeveName, totalCAD, exchangeRate
```

**Current implementation uses Option A** for simplicity, but this should be reviewed.

## Core Algorithm

**Implementation approach:**

1. **Filter active weights:** Remove zero-weight securities (weight === 0)
2. **Calculate total weight:** Sum remaining weights (should be ~100, but can handle non-integer values like 10.5)
3. **For each security:**
   - Calculate normalized weight: `weight / totalWeight`
   - Calculate target in CAD: `totalAmountCAD × normalizedWeight`
   - Determine currency: Check if symbol is in `usd_symbols` array
   - If USD security: Convert to USD: `targetCAD / exchangeRate`
   - If CAD security: Keep as-is

**Output:** List of securities with target amounts in their native currencies

## Example Usage

```typescript ignore
import SleeveCalculator from '@renoirb/investing-sleeve-calculator'

// Load and parse sleeves.yaml
const parsedSleevesObj = {
  sleeves: {
    core: {
      weights: {
        AVDV: 10,
        AVUV: 6,
        VUN: 13,
        ZCN: 13,
        ZEA: 16,
        ZDM: 9,
        ZEM: 11,
        STPL: 13,
        ZJPN: 3,
        VA: 3,
        XCH: 3,
      },
      usd_symbols: ['AVDV', 'AVUV'],
    },
    'core-USD': {
      weights: {
        DISV: 10,
        DFSV: 6,
        VTI: 13,
        DFAX: 30,
        VEA: 10,
        VWO: 9,
        KXI: 13,
        EWJ: 3,
        DRAG: 3,
        VTV: 3,
      },
      usd_symbols: ['VTI', 'VEA', 'VWO', 'DFSV', 'DISV', 'KXI', 'EWJ', 'VTV'],
    },
  },
}

// Instantiate calculator (validates config)
const calculator = new SleeveCalculator(parsedSleevesObj)

// Calculate targets for 5K CAD in core sleeve at 1.42 exchange rate
const calcResult = calculator.calculate('core', 5000, 1.42)

// calcResult.targets contains each security and its target amount:
// [
//   { symbol: 'AVDV', targetAmount: 352.11, currency: 'USD', weight: 10, normalizedWeight: 0.10 },
//   { symbol: 'AVUV', targetAmount: 211.27, currency: 'USD', weight: 6, normalizedWeight: 0.06 },
//   { symbol: 'VUN', targetAmount: 650.00, currency: 'CAD', weight: 13, normalizedWeight: 0.13 },
//   { symbol: 'ZCN', targetAmount: 650.00, currency: 'CAD', weight: 13, normalizedWeight: 0.13 },
//   ... etc
// ]

// Use cases:
// 1. Check if account matches target amounts
// 2. Program DCA buy orders
// 3. Generate rebalancing tasks
// 4. Display allocation breakdown
```

## Type Contracts

### Input Types

```typescript
export type CurrencyCode = 'CAD' | 'USD'

export interface SleeveWeights {
  [symbol: string]: number // Weight percentage (can be non-integer, e.g., 10.5)
}

export interface SleeveDefinition {
  weights: SleeveWeights
  usd_symbols?: string[] // Optional, defaults to []
}

export interface SleevesConfig {
  sleeves: {
    [sleeveName: string]: SleeveDefinition
  }
}
```

### Output Types

```typescript
import { type CurrencyCode } from './core.ts'

export interface SecurityTarget {
  symbol: string
  targetAmount: number // In security's native currency
  currency: CurrencyCode // 'CAD' or 'USD'
  weight: number // Original weight from config
  normalizedWeight: number // Weight as decimal (0-1), e.g., 0.10 for 10%
}

export interface CalculationResult {
  sleeveName: string
  totalAmountCAD: number
  exchangeRate: number
  targets: SecurityTarget[]
  summary: {
    totalCAD: number // Sum of CAD targets
    totalUSD: number // Sum of USD targets (in USD)
    totalUSDInCAD: number // USD total converted to CAD
  }
}
```

## Validation Rules

### Constructor Validation

1. **Config structure:** Must have `sleeves` object
2. **Sleeve weights:** Each sleeve must have `weights` object
3. **Weight sum:** Weights should sum to ~100 (tolerance: ±0.1)
   - Excludes zero-weight securities (weight === 0)
   - Excludes "watching" positions (weight < 0.1)
4. **USD symbols:** If present, must be an array of strings

### Calculate Method Validation

1. **Sleeve exists:** Throw if sleeve name not found in config
2. **Total amount:** Must be > 0
3. **Exchange rate:** Must be > 0

## Error Handling

All validation errors should fail early with descriptive messages:

```typescript ignore
// Example error messages
throw new Error('Sleeve "core" not found in configuration')
throw new Error('Sleeve "core" weights sum to 95.5%, expected ~100%')
throw new Error('Total amount must be greater than 0')
throw new Error('Exchange rate must be greater than 0')
```

## File Structure

```
./
 ├── PACKAGE_CONTEXT.md     # This file
 ├── CLAUDE.md              # Project context for LLM sessions
 ├── README.md              # Package overview
 ├── deno.json              # Deno configuration
 ├── core.ts                # Main entry point (bootstrapper)
 ├── deno.ts                # Deno's Interactive CLI implementation
 └── src/
     ├── index.ts           # Public API exports
     ├── types.ts           # Type definitions
     ├── calculator.ts      # SleeveCalculator class
     ├── calculator.test.ts # SleeveCalculator tests (5 test suites)
     ├── drift.ts           # DriftCalculator class
     ├── drift.test.ts      # DriftCalculator tests (10 test suites)
     └── sleeves.examples.ts# Example sleeve configurations
```

## DriftCalculator - Companion Class

The `DriftCalculator` class works alongside `SleeveCalculator` to compare targets vs actual holdings and generate buy/sell tasks.

### Design Principles

- **Self-contained**: Stores targets with currency info, no external dependencies
- **Mutable state**: Call `setCurrentlyOwning()` to update holdings
- **Immediate feedback**: `getDelta()` returns current drift for any security
- **Rehydratable**: `toJSON()` / `fromJSON()` for serialization
- **Data only**: No formatting logic, just calculations

### API

```typescript ignore
// 1. Get targets from calculator
const targets = calculator.calculate('core', 5000, 1.39)

// 2. Create drift calculator with targets
const drift = new DriftCalculator(targets)

// 3. Set current holdings (updates internal state)
drift.setCurrentlyOwning('VUN', 946)
drift.setCurrentlyOwning('AVDV', 299)
drift.setCurrentlyOwning('AVUV', 358)

// 4. Get delta for specific security (immediate feedback)
const delta = drift.getDelta('VUN')
// Returns: { symbol: 'VUN', from: 946, to: 787, delta: -159, action: 'sell', currency: 'CAD' }

// 5. Get all deltas
const tasks = drift.getTasks()

// 6. Serialize for rehydration
const state = drift.toJSON()

// 7. Rehydrate from saved state
const restored = DriftCalculator.fromJSON(state)
```

### Currency Handling

Currency is inferred from targets - no need to specify when setting actuals:

```typescript ignore
drift.setCurrentlyOwning('AVDV', 299) // Knows it's USD from targets
drift.setCurrentlyOwning('VUN', 946) // Knows it's CAD from targets
```

### Use Cases

1. **HTML forms**: Calculate, save state, reload, recalculate
2. **Interactive rebalancing**: Update holdings, see immediate impact
3. **Task generation**: Generate buy/sell recommendations
4. **API endpoints**: Serialize/deserialize state

## Interactive CLI Tool

The package includes an interactive command-line interface for manual rebalancing workflows.

### Features

**User Input Flow:**

1. Select sleeve name (from available sleeves)
2. Enter total CAD allocation
3. Enter CAD/USD exchange rate
4. Optionally enter current holdings for each security

**Output:**

- Calculation results (targets by security)
- Rebalancing tasks grouped by action:
  - **SELL** (shown first - frees liquidity)
  - **BUY** (shown second - requires liquidity)
  - **HOLD** (shown last - already balanced)
- Minified state (JSON) for logging/reproduction

**Task Ordering Rationale:**
When allocation is tight, you must sell before buying. Showing SELL tasks first ensures proper execution order.

**State Output:**
The minified JSON state can be used to:

- Log rebalancing sessions
- Reproduce calculations later
- Share state with other tools
- Rehydrate via `DriftCalculator.fromJSON(state)`

### Usage

```bash
# Use built-in example sleeves
deno run --allow-read cli.ts

# Or run deno.ts directly
deno run --allow-read deno.ts

# Load custom sleeves.yaml
deno run --allow-read deno.ts /path/to/sleeves.yaml

# Via task (uses examples)
deno task cli
```

### Implementation

- **core.ts**: Dependency free module
- **deno.ts**: Full interactive implementation
  - Input validation with retry
  - Default values for quick testing
  - Cancel support (Ctrl+C)
  - Formatted table output
  - State serialization

## Integration Points

This package will be used by:

1. **Report Generators** - Display allocation breakdowns and drift analysis
2. **Web UI** - Show target allocations, visualizations, and rebalancing tasks
3. **CLI tools** - Generate actionable buy/sell task lists
4. **API endpoints** - Provide calculation and drift analysis services

## Implementation Status

### SleeveCalculator

- [x] Requirements documented
- [x] Design decisions captured
- [x] Type contracts defined
- [x] Core implementation
- [x] Comprehensive test suite (5 test suites, 22 test steps)
  - Constructor validation
  - Calculate method (CAD-only, USD-only, mixed)
  - Weight filtering and normalization
  - Validation errors
  - Helper methods
  - Real-world scenarios
- [x] Integration examples

### DriftCalculator

- [x] Requirements documented
- [x] Design decisions captured
- [x] Type contracts defined
- [x] Core implementation
- [x] Comprehensive test suite (10 test suites, 27 test steps)
  - Constructor and initialization
  - setCurrentlyOwning validation
  - getDelta calculations (buy/sell/hold)
  - getTasks and getActionableTasks
  - Serialization (toJSON/fromJSON)
  - clearActuals
  - Real-world rebalancing scenarios
  - Edge cases (small amounts, large differences, fractional shares)
  - Currency handling
- [x] Integration examples

### Interactive CLI

- [x] Full implementation (deno.ts)
- [x] Input prompts with validation
- [x] Task ordering (SELL → BUY → HOLD)
- [x] Minified state output
- [x] Formatted table display
- [x] Error handling

**Testing Summary:**

- Total: 15 test suites, 49 test steps
- All tests passing
- Coverage: Core calculations, edge cases, serialization, real-world scenarios

## Open Questions

1. **Calculate method signature** - Which option (A, B, or C above)?
2. **Weight tolerance** - Is ±0.1% acceptable for weight sum validation?
3. **Rounding** - Should target amounts be rounded? To how many decimals?
4. **Zero-weight threshold** - Use 0.1 as minimum weight, or stricter/looser?

## Related Files

**Parent Portfolio System** (this package will be imported by):

- System documentation: `<Path to Obsidian Vault>/Agentic-Writing-Contexts/2025-11-06-Investing-Portfolio-Balancing-Strategy/`
- Key context files:
  - `CLAUDE.md` - Portfolio system overview
  - `LLM-Context-Investment-Focus-Snapshot-Files.md` - Snapshot data structure
  - `2025-11-06-PORTFOLIO-SYSTEM-SUMMARY.md` - Complete requirements

**This Package:**

- Type definitions: `./src/types.ts`
- Example configurations: `./src/sleeves.examples.ts`
- Core calculator: `./src/calculator.ts`
- Drift calculator: `./src/drift.ts`
- Interactive CLI: `./deno.ts`

## Notes

- This is a **pure calculation engine** - no file I/O, no external dependencies
- Designed to work in Deno, Node, and browser environments
- All inputs are explicit - no global state or environment variables
- Immutable - calculator doesn't modify input configuration
