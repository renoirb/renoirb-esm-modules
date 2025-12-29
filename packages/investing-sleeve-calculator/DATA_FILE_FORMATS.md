# Data File Formats - Authoritative Specification

## Overview

This document defines the authoritative specification for all data file formats used in the portfolio management system.

**Purpose:** Provide canonical type definitions and format specifications that can be referenced across the system.

**Scope:** Covers snapshot data files, allocation files, and aggregate state files.

---

## File Structure Overview

```
historical-data/
└── YYYYMMDD/              # Snapshot date (e.g., 20251223)
    ├── allocation.yaml    # Target allocations by person/account/sleeve
    ├── unallocated.yaml   # Cash not yet deployed
    ├── totals.yaml        # Account totals with performance
    ├── Renoir-RRSP.json   # Holdings snapshot
    ├── Renoir-TFSA.json
    ├── Renoir-Crypto.json
    ├── Gabi-RRSP.json
    ├── Gabi-TFSA.json
    └── Gabi-Crypto.json
```

---

## 1. Brokerage Snapshot Files

**File Pattern:** `<Person>-<Account>.json`
**Examples:** `Renoir-RRSP.json`, `Gabi-TFSA.json`

### Format Specification

```typescript
/**
 * Complete brokerage account snapshot
 * Generated from manual brokerage extraction
 */
export interface BrokerageSnapshot {
  timestamp: string          // ISO 8601 format with timezone
  account: {
    totals: {
      CAD: string           // Total account value in CAD
      USD: string           // Total account value in USD
    }
  }
  holdings: BrokerageHolding[]
}

/**
 * Single holding/position in brokerage account
 */
export interface BrokerageHolding {
  symbol: string                    // Security symbol
  name: string                      // Full security name
  totalValue: string                // Total position value with + prefix
  currency: 'CAD' | 'USD'          // Position currency
  shares: string                    // Share count (may include text like "coins")
  currentPrice: string              // Current price with + prefix
  currentDiffPercent: string        // Day change percentage with +/- prefix
  allTimeReturn: {
    value: string                   // Lifetime gain/loss with +/- prefix
    percent: string                 // Lifetime return % with +/- prefix
  }
}
```

### Example File

```json
{
  "timestamp": "2025-12-23T16:46:09GMT-5",
  "account": {
    "totals": {
      "CAD": "6628.32",
      "USD": "0.00"
    }
  },
  "holdings": [
    {
      "symbol": "PHYS",
      "name": "Sprott Physical Gold Trust",
      "totalValue": "+6628.32",
      "currency": "CAD",
      "shares": "1,200",
      "currentPrice": "+47.19",
      "currentDiffPercent": "+1.31",
      "allTimeReturn": {
        "value": "+14139.57",
        "percent": "+33.28"
      }
    },
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "totalValue": "+13685.95",
      "currency": "CAD",
      "shares": "0.114 coins",
      "currentPrice": "+120052.23",
      "currentDiffPercent": "-0.63",
      "allTimeReturn": {
        "value": "-2080.79",
        "percent": "-13.20"
      }
    }
  ]
}
```

### Field Notes

**String Format Choices:**
- Monetary values use strings to preserve precision (avoid floating-point errors)
- `+` prefix indicates positive values (easier visual scanning)
- Commas in large numbers (e.g., `"1,200"`)
- Text suffixes for units (e.g., `"coins"`, `"shares"`)

**Timestamp Format:**
- Manual extraction time with timezone
- Format: `YYYY-MM-DDTHH:mm:ssTZ`
- Example: `"2025-12-23T16:46:09GMT-5"`

---

## 2. Allocation File

**File Name:** `allocation.yaml`
**Purpose:** Define target allocations by person, account, and sleeve

### Format Specification

```typescript
/**
 * Target allocations for the portfolio
 * Specifies how much (in CAD) should be allocated to each sleeve
 */
export interface AllocationsConfig {
  [person: string]: {
    [account: string]: {
      [sleeveName: string]: number  // Target allocation in CAD
    }
  }
}
```

### Example File

```yaml
Gabi:
  RRSP:
    core: 83000

Leo:
  RESP:
    core-RBCDI: 6000

Renoir:
  TFSA:
    core: 5500
    income: 10500
    bullion: 5800
  RRSP:
    core: 72000
    bullion: 139000
    growth-USD: 7300
  Crypto:
    BTC: 12400
    LTC: 500
    SUI: 500
```

### Structure Rules

1. **Person Level** - Top-level keys are person names
2. **Account Level** - Second-level keys are account types (RRSP, TFSA, etc.)
3. **Sleeve Level** - Third-level keys are sleeve names with numeric CAD values
4. **Values** - All amounts in CAD (no currency suffix)
5. **Sleeve Names** - Must match sleeve definitions in `sleeves.yaml`

### Validation

- Person names: Any string (case-sensitive)
- Account names: Common values are RRSP, TFSA, RESP, Crypto
- Sleeve names: Must exist in `SleevesConfig`
- Amounts: Positive integers (CAD)

---

## 3. Unallocated File

**File Name:** `unallocated.yaml`
**Purpose:** Track cash/holdings not yet allocated to sleeves

### Format Specification

```typescript
/**
 * Unallocated funds by person and account
 * Cash or securities not yet assigned to sleeves
 */
export interface UnallocatedConfig {
  [person: string]: {
    [account: string]: {
      CAD?: number  // Unallocated CAD amount
      USD?: number  // Unallocated USD amount
    }
  }
}
```

### Example File

```yaml
Gabi:
  TFSA:
    CAD: 31507
    USD: 4154
  RRSP:
    CAD: 118600
    USD: 166
  Crypto:
    CAD: 7

Renoir:
  Crypto:
    CAD: 73
  TFSA:
    CAD: 3268
    USD: 964
  RRSP:
    CAD: 12819
    USD: 1891
```

### Structure Rules

1. **Person Level** - Top-level keys are person names
2. **Account Level** - Second-level keys are account types
3. **Currency Level** - CAD and/or USD with numeric values
4. **Omit Zero** - Don't include CAD/USD if amount is 0

### Use Cases

- **Dry Powder** - Cash waiting to be deployed
- **Recent Deposits** - Money added but not yet invested
- **Between Rebalancing** - Funds freed from sales, pending buys
- **Account Minimums** - Required cash balances

---

## 4. Totals File

**File Name:** `totals.yaml`
**Purpose:** Account totals with performance metrics

### Format Specification

```typescript
/**
 * Account totals and performance summary
 */
export interface TotalsConfig {
  [person: string]: {
    Total?: {
      CAD?: number     // Total across all accounts (optional)
    }
    Cash?: {
      CAD?: number     // Total cash across accounts (optional)
    }
    [account: string]: {
      CAD?: number     // Account total in CAD
      USD?: number     // Account total in USD (if applicable)
    }
  }
}
```

### Example File

```yaml
Gabi:
  Total:
    CAD: # Calculated field (optional)
  Cash:
    CAD: # Calculated field (optional)
  TFSA:
    CAD: 169300  # +$9,535.11 (+5.96%) past month
  RRSP:
    CAD: 447036  # +$40,325.30 (+9.92%) past month
  Crypto:
    CAD: 8950    # −$172.73 (−1.89%) past month

Renoir:
  Total:
    CAD: 308283  # +$79,756.61 (+34.91%) this year
  Cash:
    CAD: 789
  Crypto:
    CAD: 13757   # −$359.25 (−2.54%) past month
  TFSA:
    CAD: 30272   # +$1,002.10 (+3.42%) past month
    # Contributions:
    # - 1500
  RRSP:
    CAD: 263420  # +$26,979.08 (+11.41%) past month
```

### Field Notes

**Comments:**
- Performance notes in YAML comments (e.g., `# +$9,535.11 (+5.96%) past month`)
- Contribution tracking in comments
- Not parsed by code, for human reference only

**Calculated Fields:**
- `Total` and `Cash` may be calculated from other sources
- Can be omitted or set to `#` (comment) if not calculated

**Account Totals:**
- Should match sum of holdings in corresponding JSON file
- May differ slightly due to timing/rounding

---

## 5. Sleeve Definitions

**File Name:** `sleeves.yaml` (or defined in code)
**Purpose:** Define portfolio sleeves with target weights

### Format Specification

```typescript
/**
 * Complete sleeves configuration
 */
export interface SleevesConfig {
  sleeves: {
    [sleeveName: string]: SleeveDefinition
  }
}

/**
 * Single sleeve definition
 */
export interface SleeveDefinition {
  name?: string              // Display name (optional)
  doc?: string              // Documentation reference (optional)
  description?: string      // Description (optional)
  weights: SleeveWeights    // Security weights (required)
  usd_symbols?: string[]    // USD-denominated securities (optional)
  min_task_threshold?: number  // Minimum rebalancing amount (optional)
}

/**
 * Security weights within a sleeve
 */
export interface SleeveWeights {
  [symbol: string]: number  // Weight percentage (can be non-integer)
}
```

### Example File

```yaml
sleeves:
  core:
    name: "Portfolio Core 5FP Sleeve in CAD"
    doc: "Portfolio Core Sleeve"
    description: "Modified Fama French Five Factor Model"
    weights:
      AVDV: 10
      AVUV: 6
      VUN: 13
      ZCN: 13
      ZEA: 16
      ZDM: 9
      ZEM: 11
      STPL: 13
      ZJPN: 3
      VA: 3
      XCH: 3
    usd_symbols:
      - AVDV
      - AVUV
    min_task_threshold: 20

  bullion:
    name: "Portfolio Bullion Sleeve"
    doc: "Portfolio Bullion Sleeve"
    description: "Precious metals physical trusts"
    weights:
      PHYS: 40
      PSLV: 25
      GOLD: 10
      U.UN: 15
      COP.UN: 5
      GPH: 5
```

### Validation Rules

1. **Weight Sum** - Active weights (≥ 0.1) should sum to ~100 (tolerance: ±0.1)
2. **Zero Weights** - Securities with weight 0 or < 0.1 are "watching" positions
3. **USD Symbols** - If present, must be array of strings
4. **Symbol Match** - All symbols in `usd_symbols` must exist in `weights`

---

## Parsing Utilities

### String to Number Conversion

```typescript
/**
 * Parse monetary string to number
 * Handles: "+56628.00", "56628.00", "-123.45"
 */
export const parseMoneyString = (value: string): number => {
  return parseFloat(value.replace(/[+,]/g, ''))
}

/**
 * Parse share count string to number
 * Handles: "1,200", "0.0745 coins", "1 ounce"
 */
export const parseSharesString = (shares: string): number => {
  const cleaned = shares
    .replace(/[,]/g, '')
    .replace(/\s*(coins?|shares?|ounces?)\s*/i, '')
  return parseFloat(cleaned)
}
```

### YAML Parsing

```typescript
import { parse as parseYaml } from '@std/yaml'

/**
 * Parse allocation.yaml
 */
export const parseAllocations = (
  yamlContent: string
): AllocationsConfig => {
  return parseYaml(yamlContent) as AllocationsConfig
}

/**
 * Parse sleeves.yaml
 */
export const parseSleeves = (
  yamlContent: string
): SleevesConfig => {
  return parseYaml(yamlContent) as SleevesConfig
}
```

---

## File Naming Conventions

### Snapshot Directory

**Pattern:** `YYYYMMDD`
**Example:** `20251223` (December 23, 2025)

### Person Names

**Case:** As written (preserve case)
**Examples:** `Renoir`, `Gabi`, `Leo`

### Account Names

**Standard Values:**
- `RRSP` - Registered Retirement Savings Plan
- `TFSA` - Tax-Free Savings Account
- `RESP` - Registered Education Savings Plan
- `Crypto` - Cryptocurrency holdings
- `Cash` - Cash/savings accounts

**Format:** ALL CAPS, no spaces

### Sleeve Names

**Base Sleeve:** Single word, lowercase
**Examples:** `core`, `bullion`, `income`, `growth`, `stocks`

**Variants:** `base-variant`
**Examples:** `core-USD`, `core-RBCDI`, `bullion-USD`, `growth-USD`

**Variant Suffixes:**
- `USD` - USD-denominated securities only
- `RBCDI` - Commission-free at RBC Direct Investing
- `RESP` - Designed for RESP accounts

---

## Data Flow

```
Brokerage Account (Manual Extraction)
    ↓
<Person>-<Account>.json files
    ↓
PortfolioAggregate.addHolding()
    ↓
    ├─→ allocation.yaml (target allocations)
    ├─→ sleeves.yaml (sleeve definitions)
    └─→ unallocated.yaml (reference for cash)
    ↓
getAccountState() → AccountSleeveState[]
    ↓
    ├─→ Current weights (from holdings)
    ├─→ Target weights (from sleeves)
    ├─→ Drift (allocated vs actual)
    └─→ Undeployed cash
```

---

## Versioning

**Current Version:** 1.0
**Date:** 2024-12-24

### Change Log

- **1.0 (2024-12-24)** - Initial specification
  - Defined all file formats
  - Established naming conventions
  - Documented parsing utilities

---

## Related Files

- `PLAN_PORTFOLIO_AGGREGATOR.md` - Portfolio aggregate design
- `SECURITY_SYMBOL_REGISTRY.md` - Symbol aliasing system
- `PACKAGE_CONTEXT.md` - Calculator package design
- User's Obsidian vault - Source allocation and sleeve files

---

## Validation

### Schema Validation (Future)

```typescript
// Future: JSON Schema validation
import Ajv from 'ajv'

const brokerageSnapshotSchema = {
  type: 'object',
  required: ['timestamp', 'account', 'holdings'],
  properties: {
    timestamp: { type: 'string' },
    account: {
      type: 'object',
      required: ['totals'],
      properties: {
        totals: {
          type: 'object',
          required: ['CAD', 'USD'],
          properties: {
            CAD: { type: 'string' },
            USD: { type: 'string' }
          }
        }
      }
    },
    holdings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['symbol', 'name', 'totalValue', 'currency', 'shares'],
        // ... full schema
      }
    }
  }
}

// Validate
const ajv = new Ajv()
const validate = ajv.compile(brokerageSnapshotSchema)
const valid = validate(data)
```

### File Existence Checks

```bash
#!/bin/bash
# Verify snapshot directory structure

SNAPSHOT_DIR="./historical-data/20251223"

# Check required files exist
for person in Renoir Gabi; do
  for account in RRSP TFSA Crypto; do
    file="${SNAPSHOT_DIR}/${person}-${account}.json"
    if [ ! -f "$file" ]; then
      echo "Warning: Missing $file"
    fi
  done
done

# Check YAML files
for file in allocation.yaml unallocated.yaml totals.yaml; do
  if [ ! -f "${SNAPSHOT_DIR}/${file}" ]; then
    echo "Warning: Missing ${SNAPSHOT_DIR}/${file}"
  fi
done
```

---

## Examples

### Complete Snapshot Set

```
historical-data/20251223/
├── allocation.yaml       # Target allocations
├── unallocated.yaml     # Undeployed cash
├── totals.yaml          # Account totals
├── Gabi-Crypto.json     # 1 holding  (BTC)
├── Gabi-RRSP.json       # 15 holdings
├── Gabi-TFSA.json       # 33 holdings
├── Renoir-Crypto.json   # 3 holdings (BTC, ETH, WLD)
├── Renoir-RRSP.json     # 38 holdings
└── Renoir-TFSA.json     # 23 holdings
```

### Typical File Sizes

- **JSON holdings:** 2-50 KB per file
- **YAML allocation:** < 1 KB
- **YAML unallocated:** < 1 KB
- **YAML totals:** < 1 KB

---

## Notes

### Why String Values?

Monetary values stored as strings to:
1. Preserve exact precision from brokerage
2. Avoid floating-point representation errors
3. Allow parsing with explicit rounding decisions
4. Maintain audit trail of original values

### Why YAML for Config?

- Human-readable and editable
- Supports comments (for performance notes)
- Natural hierarchical structure
- Standard parsing libraries available

### Why JSON for Snapshots?

- Programmatic generation
- Exact data preservation
- Standard format for automated extraction
- Better for large datasets
