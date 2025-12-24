# Example Data Files

This directory contains anonymized example data demonstrating the file formats used in the portfolio management system.

## Portfolio Attribution

The example portfolio uses the **Five Factor Investing with ETFs** model portfolio published by Benjamin Felix, Portfolio Manager at PWL Capital.

**Source:** [Rational Reminder Podcast Episode 129: Five Factor Investing with ETFs](https://rationalreminder.ca/podcast/129) (December 17, 2020)

**Portfolio Composition:**
- VUN 30% - Vanguard U.S. Total Market Index ETF
- XIC 30% - BMO S&P/TSX Capped Composite Index ETF
- XEF 16% - iShares Core MSCI EAFE IMI Index ETF
- XEC 8% - iShares Core MSCI Emerging Markets IMI Index ETF
- AVUV 10% - Avantis U.S. Small Cap Value ETF
- AVDV 6% - Avantis International Small Cap Value ETF

**About Rational Reminder:**
> The Rational Reminder Podcast is a weekly podcast on sensible investing and financial decision-making. The podcast is hosted by Benjamin Felix and Dan Bortolotti, Portfolio Managers, and Cameron Passmore, Portfolio Manager and CEO at PWL Capital in Canada.

**Disclaimer:** This example is for software demonstration purposes only. It does not constitute financial advice. Consult with qualified financial professionals for investment decisions.

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
- **Allocated to Five Factor Portfolio:** ~$70,400 CAD (88%)
- **Unallocated (Cash):** ~$9,600 CAD (12%)

**Alice:** ~$40,000 CAD
- RRSP: $28,000 (allocated: $24,000)
- TFSA: $12,000 (allocated: $11,000)

**Bob:** ~$40,000 CAD
- RRSP: $40,000 (allocated: $35,400)

### Sleeve Allocations

All allocations use the same Five Factor Portfolio sleeve (`core`):

**Alice:**
- Core: $35,000 total
  - RRSP: $24,000
  - TFSA: $11,000

**Bob:**
- Core: $35,400 (RRSP)

### Securities Held

All positions follow the Five Factor Portfolio weights:

| Symbol | Name | Weight | Currency |
|--------|------|--------|----------|
| VUN | Vanguard U.S. Total Market Index ETF | 30% | CAD |
| XIC | BMO S&P/TSX Capped Composite Index ETF | 30% | CAD |
| XEF | iShares Core MSCI EAFE IMI Index ETF | 16% | CAD |
| XEC | iShares Core MSCI Emerging Markets IMI Index ETF | 8% | CAD |
| AVUV | Avantis U.S. Small Cap Value ETF | 10% | USD |
| AVDV | Avantis International Small Cap Value ETF | 6% | USD |

**Note:** AVUV and AVDV are USD-denominated securities and require currency conversion in calculations.

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
- **Weight Analysis** - Calculate current vs target weights for the Five Factor Portfolio
- **Drift Calculations** - Identify rebalancing needs across accounts
- **Report Generation** - Generate allocation breakdowns and task lists

### Example Test Scenarios

1. **Load Alice's RRSP** - Parse `Alice-RRSP.json` and analyze against `allocation.yaml`
2. **Calculate Total Portfolio** - Aggregate all accounts to get household-level view
3. **Identify Rebalancing Tasks** - Compare actual holdings to Five Factor target weights
4. **Test Currency Conversion** - Verify CAD/USD handling for AVUV and AVDV positions

---

## References

- **Five Factor Portfolio:** [Rational Reminder Podcast Episode 129](https://rationalreminder.ca/podcast/129)
- **Format Specification:** `../DATA_FILE_FORMATS.md`
- **Calculator Package:** `../README.md`
- **Rational Reminder Podcast:** <https://rationalreminder.ca/>

---

## Disclaimer

**This is example data for software demonstration only.**

- Not financial advice
- Not a recommendation to buy or sell securities
- Not a solicitation or offer
- Consult qualified financial professionals for investment decisions
- Past performance does not guarantee future results

The Five Factor Portfolio shown is published research by Benjamin Felix at PWL Capital and is used here solely to provide realistic example data for software testing.
