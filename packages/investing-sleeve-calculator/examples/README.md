# Example Data Files

This directory contains anonymized example data demonstrating the file formats used in the portfolio management system.

## Example Portfolio

The example data uses the **Five Factor Investing with ETFs** portfolio as a test case.

**For full portfolio details, attribution, and sources:**
See [`../src/sleeves.examples.ts`](../src/sleeves.examples.ts)

**Why this portfolio:**
It demonstrates the package's capability to handle mixed CAD/USD securities, multi-region diversification, and well-documented allocations backed by academic research. This is purely example data for testing - not financial advice.

---

## Directory Structure

```
examples/
└── historical-data/
    └── 20250115/              # Example snapshot date
        ├── allocation.yaml    # Target allocations
        ├── unallocated.yaml   # Undeployed cash
        ├── totals.yaml        # Account totals
        ├── Alice-RRSP.json    # Holdings snapshots
        ├── Alice-TFSA.json
        └── Bob-RRSP.json
```

## Fictional Portfolio Summary

### People and Accounts

- **Alice** - RRSP, TFSA
- **Bob** - RRSP

**Note on Account Types:** RRSP (Registered Retirement Savings Plan) and TFSA (Tax-Free Savings Account) are Canadian registered account types. In these examples, they serve simply as account labels to demonstrate multi-account portfolio management.

### Total Portfolio Value

**Total Across Both People:** ~$80,000 CAD
- **Allocated to "core" sleeve:** ~$70,400 CAD (88%)
- **Unallocated (Cash):** ~$9,600 CAD (12%)

**Alice:** ~$40,000 CAD
- RRSP: $28,000 (allocated: $24,000)
- TFSA: $12,000 (allocated: $11,000)

**Bob:** ~$40,000 CAD
- RRSP: $40,000 (allocated: $35,400)

### Sleeve Allocations

All allocations use the example "core" sleeve (see [`../src/sleeves.examples.ts`](../src/sleeves.examples.ts) for weights):

**Alice:**
- Core: $35,000 total
  - RRSP: $24,000
  - TFSA: $11,000

**Bob:**
- Core: $35,400 (RRSP)

### Securities Held

All positions use the securities defined in the "core" sleeve configuration.

---

## Data Characteristics

### Fictional But Plausible

- All data is fictional and for demonstration purposes only
- Portfolio sizes are modest (~$40K per person)
- Returns and price movements are plausible but not based on real market data
- Holdings amounts are calculated to approximate target weights with realistic drift

### File Format Compliance

- All files match specifications in `../DATA_FILE_FORMATS.md`
- Brokerage snapshots (JSON) use string formatting for monetary values
- Allocation files (YAML) use Canadian registered account naming conventions
- Demonstrates both CAD and USD currency handling

---

## Usage

These files can be used to test:

- **File Parsing** - Load and parse brokerage JSON and YAML allocation files
- **Portfolio Aggregation** - Combine holdings across multiple people and accounts
- **Weight Analysis** - Calculate current vs target weights
- **Drift Calculations** - Identify rebalancing needs across accounts
- **Report Generation** - Generate allocation breakdowns and task lists

### Example Test Scenarios

1. **Load Alice's RRSP** - Parse `Alice-RRSP.json` and analyze against `allocation.yaml`
2. **Calculate Total Portfolio** - Aggregate all accounts to get household-level view
3. **Identify Rebalancing Tasks** - Compare actual holdings to target weights
4. **Test Currency Conversion** - Verify CAD/USD handling for USD-denominated securities

---

## References

- **Portfolio Attribution:** See [`../src/sleeves.examples.ts`](../src/sleeves.examples.ts)
- **Format Specification:** [`../DATA_FILE_FORMATS.md`](../DATA_FILE_FORMATS.md)
- **Calculator Package:** [`../README.md`](../README.md)

---

## Disclaimer

**This is example data for software demonstration only.**

- Not financial advice
- Not a recommendation to buy or sell securities
- Not a solicitation or offer
- Consult qualified financial professionals for investment decisions
- Past performance does not guarantee future results
