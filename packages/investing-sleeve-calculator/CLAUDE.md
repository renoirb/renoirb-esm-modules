# Project Context - Sleeve Calculator

## Summary

Pure TypeScript calculation engine for portfolio sleeve (i.e. a sub-grouping from the total we want "invested") target allocations with CAD/USD currency conversion. Designed for Canadian investors managing multi-currency portfolios.

## Project Purpose

**What it does:**

- Calculates target amounts for securities in a portfolio sleeve
- Handles CAD/USD currency conversion
- Compares target vs actual holdings (drift calculation)
- Generates rebalancing tasks

**What it doesn't do:**

- Track actual holdings persistently
- Connect to brokerages or APIs
- Store allocation decisions
- Handle multi-currency inputs (assumes CAD in, converts USD out whenever applicable)

## Technical Stack

- **Runtime:** Deno
- **Language:** TypeScript with ESM modules
- **Testing:** Deno test (`deno test`)
- **Package Type:** Pure calculation library (no external dependencies)

## Project Structure

```
./
 ├── CLAUDE.md                              # This file - LLM context
 ├── PACKAGE_CONTEXT.md                     # Comprehensive design doc
 ├── README.md                              # Package overview
 ├── deno.json                              # Deno configuration
 ├── core.ts                                # Main entry point
 ├── deno.ts                                # Interactive CLI implementation
 ├── DATA_FILE_FORMATS.md                   # File format specifications
 ├── SECURITY_SYMBOL_REGISTRY.md            # Symbol aliasing design
 ├── PLAN_PORTFOLIO_AGGREGATOR.md           # 📝 NEXT - Portfolio aggregator spec
 ├── PLAN_USD_WHEN_USD_ONLY_SLEEVE_INPUT.md # 💭 FUTURE - USD input for USD-only sleeves
 ├── PLAN_REFACTOR_SRC_DIRECTORY.md         # ⏸️ ON HOLD - Awaiting cross-runtime architecture
 ├── PLAN_DIST_TARGETS_SCRIPTS.md           # 💭 FUTURE - Distribution variants spec
 ├── PLAN_PUBLISH_AS_PART_OF_RENOIR_ESM_MODULES.md  # ✅ COMPLETE
 ├── src/
 │   ├── index.ts                           # Public API exports
 │   ├── types.ts                           # Type definitions
 │   ├── calculator.ts                      # SleeveCalculator class
 │   ├── calculator.test.ts                 # SleeveCalculator tests (5 test suites)
 │   ├── drift.ts                           # DriftCalculator class
 │   ├── drift.test.ts                      # DriftCalculator tests (10 test suites)
 │   └── sleeves.examples.ts                # Example sleeve configurations
 └── examples/
     ├── README.md                          # Example data overview
     ├── USAGE_EXAMPLE_CALCULATE_DRIFT.md   # Complete workflow example
     └── historical-data/
         └── 20250115/                      # Example snapshot date
             ├── allocation.yaml            # Target allocations (Five Factor Portfolio)
             ├── unallocated.yaml           # Cash positions
             ├── totals.yaml                # Account totals
             ├── Alice-RRSP.json            # Holdings snapshot
             ├── Alice-TFSA.json            # Holdings snapshot
             └── Bob-RRSP.json              # Holdings snapshot
```

## Core Classes

### SleeveCalculator

**Purpose:** Calculate target amounts for securities in a sleeve

**Usage:**

```ts ignore
const calculator = new SleeveCalculator(sleevesConfig)
const calcResult = calculator.calculate('core', 5000, 1.42)
// Returns targets for each security in native currency
```

### DriftCalculator

**Purpose:** Compare targets vs actual holdings, generate buy/sell tasks

**Usage:**

```ts ignore
const drift = new DriftCalculator(calcResult)
drift.setCurrentlyOwning('VUN', 946)
const tasks = drift.getTasks()
// Returns deltas with buy/sell/hold actions
```

## Coding Preferences for This Project

**Follow global preferences (or ask about them) plus:**

1. **Maps as source of truth** - Use private Maps for valid values, expose via controlled methods
2. **Constants over magic numbers** - Extract thresholds and business rules
3. **Assertion functions** - Validate with clear error messages
4. **One action per line** - Especially for imports, exports, function params
5. **Trailing commas** - Always, everywhere
6. **Pure functions** - Favor testability and composability

## Current State

**Status:** Active development

**Completed:**

- ✓ Core calculator implementation (`SleeveCalculator`)
- ✓ Drift calculator implementation (`DriftCalculator`)
- ✓ Type definitions
- ✓ Comprehensive test suite (15 test suites, 49 test steps)
  - ✓ `SleeveCalculator` tests ([`calculator.test.ts`](./src/calculator.test.ts))
  - ✓ `DriftCalculator` tests ([`drift.test.ts`](./src/drift.test.ts))
- ✓ Interactive CLI tool ([`deno.ts`](./deno.ts))
  - ✓ SELL-first task ordering (liquidity prioritization)
  - ✓ Minified state output for logging/reproduction
- ✓ Example usage files

**Published:**

- ✓ Published to JSR: `jsr:@renoirb/investing-sleeve-calculator@^0.1.1`
- ✓ Browser ESM imports: `https://esm.sh/jsr/@renoirb/investing-sleeve-calculator@0.1.1`

**Next Priority:**

- [ ] **Portfolio Aggregator Implementation** (see `./PLAN_PORTFOLIO_AGGREGATOR.md`)
  - New classes: `PortfolioAggregate` and `SleeveWeightAnalyzer`
  - Reverse direction analysis: holdings → current weights
  - Multi-account/multi-person state aggregation
  - See also: `./DATA_FILE_FORMATS.md`, `./SECURITY_SYMBOL_REGISTRY.md`

**Next Session TODO:**

- [ ] **Review and frame portfolio fees and exposure tracking** - Future feature to help calculate MER costs and track exposure (see README.md "Important Note on Costs" section for context). This will require security metadata (MER, asset class, geography, etc.) for each holding.
- [x] **Revise examples in design documents** to align with harmonized Alice/Bob structure:
  - `PLAN_PORTFOLIO_AGGREGATOR.md` - Updated to Alice/Bob
  - `PACKAGE_CONTEXT.md` - Updated to Alice/Bob
  - `example.ts` - Updated to Alice/Bob
  - `src/types.ts` - Updated to Alice/Bob
  - `SECURITY_SYMBOL_REGISTRY.md` - Updated to Alice/Bob

**Future Work:**

- [ ] **USD input for USD-only sleeves** (see `./PLAN_USD_WHEN_USD_ONLY_SLEEVE_INPUT.md`)
  - Add explicit `inputCurrency` parameter to `calculate()` method
  - Eliminates awkward CAD→USD conversion for USD-only portfolios
  - Feature discovered during test refactoring session
- [ ] Refactoring for code quality (see `./PLAN_REFACTOR_SRC_DIRECTORY.md`)

**Known Issues:**

- Code could benefit from refactoring to align with preferences (Maps, constants, assertions)

## Important Documentation

**Read these files for context:**

1. **PACKAGE_CONTEXT.md** - Comprehensive design decisions, algorithms, use cases
2. **PLAN_REFACTOR_SRC_DIRECTORY.md** - Current refactoring plan and analysis
3. **src/types.ts** - Type contracts and interfaces

## Domain Context

**Investment Portfolio Management:**

This package provides pure calculation utilities for portfolio sleeve allocation and drift analysis.

**Parent System Context:**

- Location: `<Path to Obsidian Vault>/Agentic-Writing-Contexts/2025-11-06-Investing-Portfolio-Balancing-Strategy/`
- This package will be **imported by** that system for sleeve calculations
- Self-contained library with no dependencies on parent system files

**Sleeve Configuration:**

- Built-in examples: `./src/sleeves.examples.ts` (for testing and demos)
- CLI accepts optional path to custom sleeves.yaml:
  ```bash
  deno run --allow-read deno.ts /path/to/sleeves.yaml
  ```
- Production systems provide their own sleeve configurations

**Key Concepts:**

- **Sleeve:** A collection of securities with target percentage weights
- **Target Amount:** How much should be allocated to each security
- **Drift:** Difference between target and actual holdings
- **Rebalancing:** Buy/sell actions to align with targets

## Development Workflow

**Running tests:**

```bash
deno test
# All tests: 15 test suites, 49 test steps
```

**Running interactive CLI:**

```bash
deno --allow-read deno.ts
# or
deno task cli
```

**CLI Features:**

- Prompts for sleeve name, total CAD, exchange rate
- Iteratively collects current holdings
- Displays rebalancing tasks (SELL → BUY → HOLD)
- Outputs minified state for logging/reproduction

**Running example:**

```bash
deno run --allow-read deno.ts
```

**Before making changes:**

1. Read `./PLAN_REFACTOR_SRC_DIRECTORY.md`
2. Ensure tests pass
3. Follow incremental refactoring steps
4. Commit after each successful step

## Integration Points

This calculator will be used by:

- Report generators (HTML/PDF allocation breakdowns)
- Web UI (interactive rebalancing interface)
- CLI tools (task generation)
- API endpoints (calculation services)

## Notes for LLM Sessions

- **Always read** PACKAGE_CONTEXT.md before suggesting architectural changes
- **Preserve backward compatibility** for public API (types, method signatures)
- **Test infrastructure must work** before refactoring (Step 0 priority)
- **Reference the refactoring plan** (PLAN_REFACTOR_SRC_DIRECTORY.md) for guidance
- **Ask about ambiguities** - don't assume business rules

## Open Questions

1. Calculate method signature - positional params vs options object?
2. Weight sum tolerance - is ±0.1% acceptable?
3. Rounding precision for target amounts?
4. Zero-weight threshold - 0.1 or different value?
5. Minimum amount before considering a buy or sell (e.g. 15\$ CAD not enough of a “_drift_”)

(See `./PACKAGE_CONTEXT.md` "Open Questions" section for details)
