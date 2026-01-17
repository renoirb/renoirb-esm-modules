# Portfolio Rebalancing Framework

Pure TypeScript implementation of the **Account-Constrained Method** for
portfolio allocation calculations.

## Design Principles

- **Pure functions**: No side effects, fully testable
- **Platform agnostic**: No file I/O, no DOM, no Node-specific APIs
- **Composable**: Builder pattern for constructing inputs
- **Type-safe**: Comprehensive TypeScript types throughout

## Module Structure

```
src/
├── types.ts        # Domain type definitions
├── builders.ts     # Factory functions for constructing inputs
├── calculations.ts # Pure calculation functions
├── formatters.ts   # Output formatting (Markdown, structured)
├── example.ts      # Usage demonstration
└── index.ts        # Barrel exports
```

## Core Concepts

### Allocation Categories

The framework uses four top-level allocation categories:

| Category    | Default Target | Components                         |
| ----------- | -------------- | ---------------------------------- |
| Reserves    | 30%            | Gold, Silver, Bitcoin, Bonds, Cash |
| Stocks      | 30%            | ETFs (Core, Income sleeves)        |
| Real Estate | 30%            | Home ownership, REITs              |
| Speculation | 10%            | Growth, Quality, Stock picks       |

### Sleeves

Securities are organized into "sleeves" which map to allocation categories:

```typescript
type SleeveId =
  | 'core'        //  → stocks
  | 'core-USD'    //  → stocks
  | 'core-RBCDI'  //  → stocks
  | 'bullion'     // → reserves
  | 'bullion-USD' // → reserves
  | 'bonds'       // → reserves
  | 'defensive'   // → reserves
  | 'crypto'      // → reserves
  | 'income'      // → stocks
  | 'quality'     // → stocks
  | 'growth'      // → speculation
  | 'growth-USD'  // → speculation
  | 'stocks'      // → speculation
```

### Account Constraints

Different account types have different constraints:

- **TFSA/RRSP/RESP**: Can receive funds, cannot transfer out
- **Crypto**: Locked (cannot move funds to/from registered accounts)
- **Managed**: Locked, assumed 90% stocks allocation
- **Chequing**: Fully liquid

## Usage

```typescript
import {
  account,
  hardAsset,
  person,
  portfolioInput,
  calculateRebalancing,
  resultToMarkdown,
  formatResult,
} from './index.ts'

// Build person's portfolio
const Alice = person({
  name: 'Alice',
  accounts: [
    account({
      type: 'TFSA',
      totalValue: 50000,
      sleeves: [
        {
          sleeveId: 'core',
          holdings: [
            { symbol: 'VUN', totalValue: '25000', currency: 'CAD' },
            { symbol: 'ZEA', totalValue: '15000', currency: 'CAD' },
          ],
        },
        {
          sleeveId: 'bullion',
          holdings: [{ symbol: 'PHYS', totalValue: '5000', currency: 'CAD' }],
        },
      ],
      unallocated: { CAD: 5000, USD: 0 },
    }),
  ],
  hardAssets: [
    hardAsset({
      type: 'realEstate',
      description: 'Home',
      value: 500000,
      ownershipPercent: 0.5,
    }),
  ],
})

// ================= Basic Calculations =================
// Run calculation
const exampleBasicCalculation = portfolioInput({
  persons: [Alice],
  exchangeRates: { CAD: 1.0, USD: 1.38 },
})

const result = calculateRebalancing(exampleBasicCalculation)
const markdown = resultToMarkdown(formatResult(result))
console.log('Example Basic Calculations', markdown)



// ================= Customizing Sleeve Mappings =================
// Override which sleeves count toward which categories:

import {
  DEFAULT_SLEEVE_CATEGORY_MAPPING,
} from './index.ts'

const exampleOverrideSleeveMapping = portfolioInput({
  persons: [Alice],
  sleeveCategoryMapping: {
    ...DEFAULT_SLEEVE_CATEGORY_MAPPING,
    // Treat income as reserves instead of stocks
    income: 'reserves',
  },
})

console.log('Example Override Sleeve Mapping', exampleOverrideSleeveMapping);



// ================= Customizing Target Allocation =================

const exampleCustomizedTTargetAllocation = portfolioInput({
  persons: [Alice],
  targetAllocation: {
    reserves: 0.25, // 25%
    stocks: 0.35, // 35%
    realEstate: 0.3, // 30%
    speculation: 0.1, // 10%
  },
})
console.log('Example Customized Target Allocation', exampleCustomizedTTargetAllocation);
```

## Calculation Flow

The framework follows this algorithm:

### Step 1: Real Estate Check

Calculate if real estate exceeds target percentage of total portfolio.

### Step 2: Rebase Targets (if RE overweight)

If real estate is overweight, treat it as "locked at target" and normalize
remaining categories to 100% of investable assets:

```
Adjusted Reserves = (30% / 70%) = 42.86%
Adjusted Stocks   = (30% / 70%) = 42.86%
Adjusted Speculation = (10% / 70%) = 14.29%
```

### Step 3: Calculate Current Allocation

Sum holdings by category across all accounts.

### Step 4: Gap Analysis

Compare current allocation to targets, produce delta amounts.

### Step 5: Deployment Recommendations

Generate suggestions for deploying unallocated cash based on gaps.

## Output Formats

### Structured (`FormattedResult`)

For programmatic consumption (Web forms, APIs):

```typescript ignore
const result = calculateRebalancing(input)
const formatted = formatResult(result)
// Access formatted.persons[0].gaps, etc.
```

### Markdown

For documents and CLI:

```typescript ignore
const markdown = resultToMarkdown(formatted)
```

## Platform Integration

### Web Form

```typescript ignore
// React example
const [result, setResult] = useState<FormattedResult | null>(null)

const handleCalculate = (formData: FormData) => {
  const input = buildPortfolioInputFromForm(formData)
  const raw = calculateRebalancing(input)
  setResult(formatResult(raw))
}
```

### CLI

```typescript ignore
// Deno example
const input = await loadPortfolioFromYaml('portfolio.yaml')
const result = calculateRebalancing(input)
console.log(resultToMarkdown(formatResult(result)))
```

### Document Generation

```typescript ignore
const markdown = resultToMarkdown(formatResult(result))
await Deno.writeTextFile('rebalancing-report.md', markdown)
```

## Development

```bash
# Type check
deno task check

# Run example
deno task example

# Run tests
deno task test
```

## License

Private / Internal Use



<!--
# Maintaining This Document

You can edit the document and leverage Deno to run the code snippets and verify correctness.

```
deno test --doc src/core/portfolio-sleeves-allocation/README.md
```

-->