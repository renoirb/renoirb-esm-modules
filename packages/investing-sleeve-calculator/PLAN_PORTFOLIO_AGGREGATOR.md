# Portfolio Aggregator - Design Document

## Status

📝 **NEXT** - Specification in progress

**Phase:** Design/specification - refining requirements before implementation
**Priority:** High - Primary focus after documentation harmonization
**Dependencies:** Examples harmonization (completed)

## Overview

**Purpose:** Extend the sleeve calculator package with state management capabilities for multi-account portfolio aggregation and analysis.

**Problem Statement:**
- Current `SleeveCalculator` calculates targets (forward direction: allocation → targets)
- Current `DriftCalculator` compares targets vs actuals (generates buy/sell tasks)
- **Missing:** Reverse direction calculation (actual holdings → current weights %)
- **Missing:** Multi-account/multi-person state aggregation

**Solution:**
Add two new classes:
1. `SleeveWeightAnalyzer` - Calculate current weights from actual holdings (reverse direction)
2. `PortfolioAggregate` - Manage portfolio-wide state across accounts and people

---

## Design Principles

1. **Separation of Concerns**
   - File loading separated from math/state management
   - Loading is external; aggregation happens via method calls

2. **Incremental Building**
   - Add holdings one at a time via `addHolding()`
   - No bulk loading built into the class

3. **Data Shape Alignment**
   - Match existing brokerage JSON structure
   - Accept objects for destructuring (cleaner API)

4. **Exchange Rate Fixed at Construction**
   - Set once when creating aggregator
   - Simplifies method signatures

5. **Sleeve Naming Convention**
   - Base sleeve: single word (e.g., `bullion`, `core`, `income`)
   - Variants: `base-variant` (e.g., `core-USD`, `core-RBCDI`)
   - Variant suffix describes constraint (USD-only, commission-free, etc.)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Brokerage JSON Files (External)                        │
│  • Bob-RRSP.json, Alice-TFSA.json, etc.              │
└─────────────────┬───────────────────────────────────────┘
                  ↓
         (File loading is external)
                  ↓
┌─────────────────────────────────────────────────────────┐
│ PortfolioAggregate (NEW)                               │
│  • addHolding(person, account, holding)                 │
│  • getAccountState(person, account)                     │
│  • Uses SleeveWeightAnalyzer internally                 │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│ SleeveWeightAnalyzer (NEW)                             │
│  • analyze(holdings, exchangeRate)                      │
│  • Returns current weights vs targets                   │
└─────────────────┬───────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────┐
│ Existing Classes (SleeveCalculator, DriftCalculator)   │
│  • Can be used alongside for rebalancing                │
└─────────────────────────────────────────────────────────┘
```

---

## Type Definitions

### Input Types (Match Brokerage JSON)

```typescript
/**
 * Brokerage holding structure (from JSON files)
 * Can be passed directly to addHolding()
 */
export interface HoldingInput {
  symbol: string
  name: string
  totalValue: string           // e.g., "+56628.00"
  currency: 'CAD' | 'USD'
  shares: string               // e.g., "1,200" or "0.0745 coins"
  currentPrice?: string        // e.g., "+47.19" (optional)
  currentDiffPercent?: string  // e.g., "+1.31" (optional)
  allTimeReturn?: {
    value: string              // e.g., "+14139.57"
    percent: string            // e.g., "+33.28"
  }
}

/**
 * Complete brokerage snapshot file structure
 */
export interface BrokerageSnapshot {
  timestamp: string
  account: {
    totals: {
      CAD: string
      USD: string
    }
  }
  holdings: HoldingInput[]
}
```

### Internal Types

```typescript
/**
 * Normalized holding (internal storage)
 */
interface NormalizedHolding extends HoldingInput {
  person: string
  account: string
  // Parsed numeric values for calculations
  totalValueNum: number
  sharesNum: number
}

/**
 * Allocation configuration (from allocation.yaml)
 */
export interface AllocationsConfig {
  [person: string]: {
    [account: string]: {
      [sleeveName: string]: number  // allocated CAD amount
    }
  }
}
```

### Output Types

```typescript
/**
 * Weight analysis for a single security
 */
export interface WeightAnalysis {
  symbol: string
  totalValue: number           // in native currency
  totalValueCAD: number        // converted to CAD
  currentWeight: number        // actual % (e.g., 52.1)
  targetWeight: number         // from sleeve definition (e.g., 60)
  weightDrift: number          // difference in % (e.g., -7.9)
  currency: CurrencyCode
}

/**
 * Complete sleeve analysis result
 */
export interface SleeveAnalysisResult {
  sleeveName: string
  totalValueCAD: number
  totalValueUSD: number
  analysis: WeightAnalysis[]
}

/**
 * Complete state for a sleeve within an account
 */
export interface AccountSleeveState {
  sleeveName: string
  allocated: number            // from allocation.yaml (target)
  actual: number               // sum of holdings (reality)
  drift: number               // allocated - actual (undeployed cash)
  holdings: HoldingSummary[]
  weightAnalysis: SleeveAnalysisResult
}

/**
 * Simplified holding summary
 */
export interface HoldingSummary {
  symbol: string
  name: string
  totalValue: number
  currency: CurrencyCode
  shares: number
}
```

---

## Class 1: SleeveWeightAnalyzer

**Purpose:** Calculate current weights from actual holdings (reverse of SleeveCalculator)

**Direction:** Holdings → Weights (reverse)

### API

```typescript
export class SleeveWeightAnalyzer {
  private sleeveName: string
  private sleeveDefinition: SleeveDefinition

  /**
   * Create analyzer for a specific sleeve
   */
  constructor(
    sleeveName: string,
    sleeveDefinition: SleeveDefinition,
  )

  /**
   * Analyze actual holdings to calculate current weights
   *
   * @param holdings - Actual holdings with values
   * @param exchangeRate - USD/CAD exchange rate
   * @returns Analysis showing current vs target weights
   */
  analyze(
    holdings: HoldingInput[],
    exchangeRate: number,
  ): SleeveAnalysisResult
}
```

### Algorithm

1. Calculate total value in CAD (convert USD holdings)
2. For each holding:
   - Convert value to CAD if needed
   - Calculate current weight: `(valueCAD / totalCAD) × 100`
   - Get target weight from sleeve definition
   - Calculate drift: `currentWeight - targetWeight`
3. Return analysis with totals and per-security breakdown

### Example Output

```typescript ignore
{
  sleeveName: 'bullion',
  totalValueCAD: 108580,
  totalValueUSD: 0,
  analysis: [
    {
      symbol: 'PHYS',
      totalValue: 56628,
      totalValueCAD: 56628,
      currentWeight: 52.1,    // actual
      targetWeight: 60,       // from sleeve definition
      weightDrift: -7.9,      // underweight
      currency: 'CAD'
    },
    {
      symbol: 'PSLV',
      totalValue: 51952,
      totalValueCAD: 51952,
      currentWeight: 47.9,
      targetWeight: 40,
      weightDrift: +7.9,      // overweight
      currency: 'CAD'
    }
  ]
}
```

---

## Class 2: PortfolioAggregate

**Purpose:** Manage portfolio-wide state across accounts and people

**Responsibilities:**
- Store holdings incrementally via `addHolding()`
- Map holdings to sleeves based on security symbols
- Calculate current weights per sleeve
- Track allocated vs actual amounts
- Coordinate analysis using `SleeveWeightAnalyzer`

### API

```typescript
export class PortfolioAggregate {
  /**
   * Create portfolio aggregate manager
   *
   * @param sleevesConfig - Sleeve definitions (from sleeves.yaml)
   * @param allocations - Target allocations by person/account (from allocation.yaml)
   * @param exchangeRate - Fixed exchange rate for this analysis
   */
  constructor(
    sleevesConfig: SleevesConfig,
    allocations: AllocationsConfig,
    exchangeRate: number,
  )

  /**
   * Add a single holding to the portfolio
   * Accepts object matching brokerage JSON structure
   *
   * @param personName - Person name (e.g., 'Bob', 'Alice')
   * @param accountName - Account name (e.g., 'RRSP', 'TFSA')
   * @param holding - Holding object from JSON
   */
  addHolding(
    personName: string,
    accountName: string,
    holding: HoldingInput,
  ): void

  /**
   * Get all holdings for a person
   */
  getPersonHoldings(personName: string): NormalizedHolding[]

  /**
   * Get all holdings for a specific account
   */
  getAccountHoldings(
    personName: string,
    accountName: string,
  ): NormalizedHolding[]

  /**
   * Get complete state analysis for an account
   * Groups holdings by sleeve and calculates drift
   *
   * @returns Array of sleeve states with weight analysis
   */
  getAccountState(
    personName: string,
    accountName: string,
  ): AccountSleeveState[]

  /**
   * Get total undeployed cash for an account
   * (allocated but not invested)
   */
  getUndeployedCash(
    personName: string,
    accountName: string,
  ): number

  /**
   * Clear all holdings (useful for reloading)
   */
  clearHoldings(): void
}
```

### Internal Methods

```typescript ignore
/**
 * Filter holdings by sleeve based on security symbols
 */
private filterHoldingsBySleeve(
  holdings: NormalizedHolding[],
  sleeveName: string,
): NormalizedHolding[]

/**
 * Parse money string: "+56628.00" → 56628.00
 */
private parseMoneyString(value: string): number

/**
 * Parse shares: "1,200" or "0.0745 coins" → number
 */
private parseSharesString(shares: string): number
```

### Storage Strategy

- Use `Map<string, NormalizedHolding>` for holdings
- Key format: `"${person}:${account}:${symbol}"`
- Allows efficient lookup and filtering
- Preserves insertion order

---

## Usage Examples

### Example 1: File Loading (Iteration)

```typescript
import { PortfolioAggregate } from '@renoirb/investing-sleeve-calculator'

// Setup
const sleevesConfig = parseSleevesYaml('./Sleeves.yaml')
const allocations = parseAllocationsYaml('./allocation.yaml')
const aggregate = new PortfolioAggregate(sleevesConfig, allocations, 1.36)

// Load from JSON file
const snapshot = JSON.parse(
  await Deno.readTextFile('./current/Bob-RRSP.json')
)

// Add all holdings - clean iteration
snapshot.holdings.forEach(holding => {
  aggregate.addHolding('Bob', 'RRSP', holding)
})

// Analyze
const state = aggregate.getAccountState('Bob', 'RRSP')
console.log(state)
```

### Example 2: Multiple Accounts

```typescript
const aggregate = new PortfolioAggregate(sleevesConfig, allocations, 1.36)

const accounts = [
  { file: 'Bob-RRSP.json', person: 'Bob', account: 'RRSP' },
  { file: 'Bob-TFSA.json', person: 'Bob', account: 'TFSA' },
  { file: 'Alice-RRSP.json', person: 'Alice', account: 'RRSP' },
  { file: 'Alice-TFSA.json', person: 'Alice', account: 'TFSA' },
]

for (const { file, person, account } of accounts) {
  const snapshot = JSON.parse(
    await Deno.readTextFile(`./current/${file}`)
  )

  snapshot.holdings.forEach(holding => {
    aggregate.addHolding(person, account, holding)
  })
}

// Analyze specific account
const renoirRRSP = aggregate.getAccountState('Bob', 'RRSP')

for (const sleeve of renoirRRSP) {
  console.log(`\n${sleeve.sleeveName}:`)
  console.log(`  Allocated: ${sleeve.allocated} CAD`)
  console.log(`  Actual:    ${sleeve.actual} CAD`)
  console.log(`  Drift:     ${sleeve.drift} CAD`)

  console.log(`  Current weights:`)
  for (const item of sleeve.weightAnalysis.analysis) {
    const sign = item.weightDrift > 0 ? '+' : ''
    console.log(
      `    ${item.symbol}: ${item.currentWeight.toFixed(1)}% ` +
      `(target: ${item.targetWeight}%, drift: ${sign}${item.weightDrift.toFixed(1)}%)`
    )
  }
}
```

### Example 3: CLI/Manual Entry

```typescript
const aggregate = new PortfolioAggregate(sleevesConfig, allocations, 1.36)

// User enters holdings manually
aggregate.addHolding('Bob', 'RRSP', {
  symbol: 'PHYS',
  name: 'Sprott Physical Gold Trust',
  totalValue: '+56628.00',
  currency: 'CAD',
  shares: '1200',
})

aggregate.addHolding('Bob', 'RRSP', {
  symbol: 'PSLV',
  name: 'Sprott Physical Silver Trust',
  totalValue: '+51952.00',
  currency: 'CAD',
  shares: '1600',
})

const state = aggregate.getAccountState('Bob', 'RRSP')
```

### Example 4: Integration with Existing Calculator

```typescript
// 1. Build state with aggregator
const aggregate = new PortfolioAggregate(sleevesConfig, allocations, 1.36)
// ... load holdings ...

// 2. Analyze current state (what IS)
const accountState = aggregate.getAccountState('Bob', 'RRSP')
const bullionState = accountState.find(s => s.sleeveName === 'bullion')

console.log('Current weights:', bullionState.weightAnalysis)

// 3. Calculate targets (what SHOULD BE)
const calculator = new SleeveCalculator(sleevesConfig)
const targets = calculator.calculate(
  'bullion',
  bullionState.allocated,  // use allocated amount
  1.36
)

// 4. Generate rebalancing tasks
const drift = new DriftCalculator(targets)
bullionState.holdings.forEach(h => {
  drift.setCurrentlyOwning(h.symbol, h.totalValue)
})

const tasks = drift.getTasks()
console.log('Rebalancing tasks:', tasks)
```

---

## Integration Points

### With Existing Calculator Package

- Add to existing `@renoirb/investing-sleeve-calculator` package
- Export alongside `SleeveCalculator` and `DriftCalculator`
- Maintain backward compatibility (no breaking changes)

### With Obsidian Module

```typescript
// Future usage in Obsidian
import {
  SleeveCalculator,
  PortfolioAggregate,
  SleeveWeightAnalyzer,
} from 'https://esm.sh/jsr/@renoirb/investing-sleeve-calculator@0.2.0'

// Can visualize current state alongside targets
const aggregate = new PortfolioAggregate(sleeveObj, allocations, 1.38)
// ... add holdings ...
const state = aggregate.getAccountState('Bob', 'RRSP')
// ... render with Dataview ...
```

### With Report Generation

- Generate markdown/HTML reports showing current vs target weights
- Identify overweight/underweight positions across all accounts
- Calculate total undeployed cash portfolio-wide

---

## Implementation Considerations

### String Parsing

**Money values:**
- Input: `"+56628.00"`, `"56628.00"`, `"-123.45"`
- Strategy: Remove `+` and `,`, parse as float
- Edge cases: Handle negative values, commas in large numbers

**Share counts:**
- Input: `"1,200"`, `"0.0745 coins"`, `"1 ounce"`
- Strategy: Remove commas and text suffixes, parse as float
- Edge cases: Fractional shares, different units

### Sleeve Mapping

**Question:** How to map holdings to sleeves when a security appears in multiple sleeve definitions?

**Strategy:** Use `allocations.yaml` as source of truth
- Only map holdings to sleeves that are allocated in that account
- If PHYS is in both `bullion` and `other` definitions, use allocation to determine which sleeve it belongs to in each account

**Example:**
```yaml
Bob:
  RRSP:
    bullion: 139000  # PHYS goes here
    core: 72000      # PHYS NOT here
```

### Error Handling

**Validation:**
- Unknown person/account in `addHolding()` → warn or allow?
- Security not found in any sleeve → how to handle?
- Allocation exists but no holdings → return empty analysis

**Current approach:**
- Allow adding holdings for any person/account (flexible)
- Filter by sleeve symbols when analyzing
- Return empty array if no holdings match sleeve

### Performance

**Considerations:**
- Holdings stored in Map for O(1) lookup
- Filtering creates new arrays (acceptable for typical portfolio sizes)
- Analysis recalculated on each `getAccountState()` call (no caching yet)

**Future optimization:**
- Cache analysis results
- Invalidate cache on `addHolding()` or `clearHoldings()`

---

## Testing Strategy

### Unit Tests

**SleeveWeightAnalyzer:**
- Calculate weights for CAD-only holdings
- Calculate weights for USD-only holdings
- Calculate weights for mixed CAD/USD holdings
- Handle empty holdings array
- Verify weight drift calculations

**PortfolioAggregate:**
- Add holdings with various string formats
- Filter holdings by person/account
- Map holdings to sleeves correctly
- Calculate account state
- Calculate undeployed cash
- Clear holdings

### Integration Tests

- Load from actual brokerage JSON files
- Verify end-to-end workflow
- Test with multiple accounts
- Compare with existing calculator results

---

## File Structure

```
./
├── PLAN_PORTFOLIO_AGGREGATOR.md  # This file
├── src/
│   ├── aggregate.ts               # PortfolioAggregate class (NEW)
│   ├── aggregate.test.ts          # Tests (NEW)
│   ├── weight-analyzer.ts         # SleeveWeightAnalyzer class (NEW)
│   ├── weight-analyzer.test.ts    # Tests (NEW)
│   ├── types.ts                   # Updated with new types
│   ├── index.ts                   # Updated exports
│   ├── calculator.ts              # Existing
│   ├── drift.ts                   # Existing
│   └── ...
```

---

## Migration Path

### Phase 1: Core Implementation
- [ ] Implement `SleeveWeightAnalyzer` class
- [ ] Implement `PortfolioAggregate` class
- [ ] Add type definitions
- [ ] Write unit tests

### Phase 2: Testing & Validation
- [ ] Test with real brokerage JSON files
- [ ] Validate calculations against manual analysis
- [ ] Integration tests with existing calculator

### Phase 3: Documentation & Publishing
- [ ] Update README with new classes
- [ ] Add usage examples
- [ ] Update PACKAGE_CONTEXT.md
- [ ] Publish new version to JSR

### Phase 4: Integration
- [ ] Update Obsidian module to use new classes
- [ ] Create report generation utilities
- [ ] Build CLI tools for portfolio analysis

---

## Open Questions

1. **Sleeve Mapping Ambiguity:**
   - If a security appears in multiple sleeve definitions, which takes precedence?
   - **Proposed:** Use `allocations.yaml` as source of truth (only map to allocated sleeves)

2. **Holdings Not in Any Sleeve:**
   - What to do with securities that don't match any sleeve definition?
   - **Proposed:** Include in a special "unallocated" category in results

3. **Exchange Rate Updates:**
   - Should exchange rate be updateable after construction?
   - **Proposed:** Keep immutable, create new instance if rate changes

4. **Caching Strategy:**
   - Should analysis results be cached?
   - **Proposed:** Start without caching, add if performance issues arise

5. **Validation Level:**
   - How strict should validation be for person/account names?
   - **Proposed:** Flexible - allow any names, validate only when analyzing

---

## Related Files

- **Existing Documentation:**
  - `PACKAGE_CONTEXT.md` - Package design and architecture
  - `CLAUDE.md` - Project context for LLM sessions
  - `README.md` - Package overview

- **Implementation:**
  - `src/calculator.ts` - SleeveCalculator (existing)
  - `src/drift.ts` - DriftCalculator (existing)
  - `src/types.ts` - Type definitions (to be updated)

- **Parent Portfolio System:**
  - Location: `<Path to Obsidian Vault>/Agentic-Writing-Contexts/2025-11-06-Investing-Portfolio-Balancing-Strategy/`
  - Context files with sleeve definitions and allocation patterns

---

## Success Criteria

**Functionality:**
- ✅ Can add holdings incrementally via simple API
- ✅ Can calculate current weights from actual holdings
- ✅ Can compare current vs target weights
- ✅ Can track allocated vs actual amounts (drift)
- ✅ Works with multi-account, multi-person portfolios

**Code Quality:**
- ✅ Clean API matching existing patterns
- ✅ Comprehensive test coverage
- ✅ Type-safe with proper TypeScript types
- ✅ Well-documented with JSDoc

**Integration:**
- ✅ Works alongside existing calculator classes
- ✅ Can be used in Obsidian modules
- ✅ Supports CLI and programmatic usage
- ✅ Published to JSR for easy consumption
