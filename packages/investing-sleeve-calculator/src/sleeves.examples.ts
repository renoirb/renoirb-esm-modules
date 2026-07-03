import {
  //
  type SleevesConfig,
} from './types.ts'

/**
 * Example Sleeves Configuration for Testing and Documentation
 *
 * This file provides realistic sleeve configurations that demonstrate:
 * - How to structure sleeves data for the SleeveCalculator
 * - Multi-currency portfolio management (CAD/USD)
 * - Different asset allocation strategies
 * - Edge cases and validation scenarios
 *
 * @example **Usage in tests:**
 * ```ts
 * import { SleeveCalculator } from './calculator.ts'
 * import { EXAMPLE_SLEEVES_CONFIG } from './sleeves.examples.ts'
 * const calculator = new SleeveCalculator(EXAMPLE_SLEEVES_CONFIG)
 * ```
 *
 * @remark
 * **Note:** This module should NOT be included in production builds.
 * It exists solely for testing and documentation purposes.
 */

/**
 * Core equity sleeve for CAD-denominated account
 *
 * **Five Factor Investing with ETFs Portfolio**
 *
 * This sleeve configuration implements the Fama-French Five-Factor Model using ETFs,
 * as published by Benjamin Felix, Portfolio Manager at PWL Capital.
 *
 * **Why this portfolio is used as an example:**
 * This package is designed to help individual investors rigorously manage their own
 * portfolios and learn the systematic work that financial advisors and portfolio
 * managers perform.
 *
 * @see {@link https://jsr.io/@renoirb/investing-sleeve-calculator#why-this-tool Why This Tool - Package purpose and fiduciary duty}
 *
 * The Five Factor Portfolio serves as both:
 * - **Test data** for the calculator's test suite
 * - **Default configuration** for the interactive CLI tool
 *
 * It demonstrates capabilities for investors who want to go beyond simple "couch potato"
 * strategies and implement more detailed, factor-based portfolio management:
 * - Mixed CAD/USD securities requiring currency conversion
 * - Multi-region diversification
 * - Non-integer weight allocations
 * - Well-documented public portfolio backed by academic research
 *
 * **Attribution:**
 * - **Author:** Benjamin Felix, CFA, CFP - Portfolio Manager at PWL Capital
 * - **Firm:** PWL Capital (Canadian financial advisory firm)
 * - **Source:** Rational Reminder Podcast Episode 129 (December 17, 2020)
 *   "Five Factor Investing with ETFs"
 * - **Podcast URL:** https://rationalreminder.ca/podcast/129
 * - **PWL Capital:** https://pwlcapital.com/our-team/benjamin-felix/
 *
 * **About the Rational Reminder Podcast:**
 * A weekly podcast on sensible investing and financial decision-making, hosted by
 * Benjamin Felix, Dan Bortolotti, and Cameron Passmore at PWL Capital in Canada.
 * Website: https://rationalreminder.ca/
 *
 * **Alternative USD-Only Variant:**
 * For a USD-only variant of this portfolio, see:
 * https://www.optimizedportfolio.com/ben-felix-model-portfolio/
 *
 * Note: This resource is not affiliated with Ben Felix or PWL Capital but provides
 * helpful reference data for U.S.-based investors.
 *
 * ---
 *
 * **IMPORTANT DISCLAIMER:**
 *
 * This is example data for software testing and demonstration purposes ONLY.
 *
 * - This is NOT financial advice
 * - This is NOT a recommendation to buy or sell securities
 * - This is NOT a solicitation or offer
 * - This package is a calculation utility and does not provide investment advice
 * - The portfolio shown is published research used solely to provide realistic
 *   example data for testing this calculation package
 * - Past performance does not guarantee future results
 * - Always consult qualified financial professionals for investment decisions
 */
export const EXAMPLE_CORE_SLEEVE_DEFINITION = {
  weights: {
    AVDV:  6, // Avantis® International Small Cap Value ETF (USD)
    AVUV: 10, // Avantis® U.S. Small Cap Value ETF (USD)
    VUN:  30, // Vanguard US Total Market ETF (CAD-hedged)
    XEC:   8, // Core MSCI EM IMI (Emerging Markets)
    XEF:  16, // Core MSCI EAFE IMI ETF (International Developed)
    XIC:  30, // Core S&P/TSX Capped Composite ETF (Canadian)
  },
  usd_symbols: [
    // Only these 2 require USD→CAD conversion
    'AVDV',
    'AVUV',
  ],
}

/**
 * Example sleeves configuration mimicking a real-world `sleeves.yaml` file.
 *
 * **Structure:**
 * - Each sleeve represents a distinct investment strategy or account type
 * - Weights are percentage allocations (must sum to ~100 per sleeve)
 * - usd_symbols identifies which securities trade in USD (others assumed CAD)
 *
 * **Sleeves Included:**
 * 1. **core** - Primary equity allocation in CAD account
 *    - Mix of Canadian, US, and International equities
 *    - Contains 2 USD-traded securities (AVDV, AVUV) requiring conversion
 *    - Diversified across regions and market caps
 *
 * 2. **bullion** - Precious metals allocation
 *    - All CAD-traded
 *    - Simpler structure with only 2 holdings
 *    - Demonstrates CAD-only sleeve pattern
 *
 * **Business Rules Demonstrated:**
 * - Weight percentages should sum to 100 (±0.1% tolerance acceptable)
 * - usd_symbols array can be empty, partial, or complete
 * - Symbol names should match keys in the weights object
 */
export const EXAMPLE_SLEEVES_CONFIG: SleevesConfig = {
  sleeves: {

    core: EXAMPLE_CORE_SLEEVE_DEFINITION,

    /**
     * Precious metals sleeve for CAD-denominated account
     *
     * **Sprott Physical Bullion Trusts**
     *
     * Source: Sprott Asset Management
     * - Physical Bullion Funds: https://sprott.com/investment-strategies/exchange-listed-products/physical-bullion-funds/
     *
     * These closed-end funds provide exposure to physical precious metals:
     * - Fully allocated and unencumbered metals held at Royal Canadian Mint
     * - Redeemable for physical metal (subject to minimum thresholds)
     * - Traded on NYSE Arca and TSX exchanges
     *
     * **Allocation Strategy:**
     * - Physical gold (PHYS): 60%
     * - Physical silver (PSLV): 40%
     *
     * **Currency Mix:**
     * - All CAD-traded (no currency conversion required)
     *
     * **DISCLAIMER:** This is example data for software demonstration only.
     * Not financial advice. Consult qualified financial professionals for investment decisions.
     */
    bullion: {
      weights: {
        PHYS: 60, // Sprott Physical Gold Trust - https://sprott.com/investment-strategies/physical-bullion-trusts/gold/
        PSLV: 40, // Sprott Physical Silver Trust - https://sprott.com/investment-strategies/exchange-listed-products/physical-bullion-funds/silver/
      },
      usd_symbols: [
        // No USD securities in this sleeve
      ],
    },
  },
}

/**
 * Five Factor Portfolio configuration (core sleeve only)
 *
 * Convenience export containing ONLY the Ben Felix Five Factor Portfolio.
 * Useful for examples and testing focused specifically on this portfolio.
 *
 * Source: Benjamin Felix, Rational Reminder Podcast Episode 129
 * URL: https://rationalreminder.ca/podcast/129
 */
export const SLEEVES_FIVE_FACTOR: SleevesConfig = {
  sleeves: {
    core: EXAMPLE_CORE_SLEEVE_DEFINITION,
  },
}
