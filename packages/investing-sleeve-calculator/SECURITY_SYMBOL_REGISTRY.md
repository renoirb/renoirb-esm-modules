# Security Symbol Registry - Design Discussion

## Overview

**Purpose:** Provide a flexible system for mapping security symbol variants to canonical forms, enabling accurate sleeve assignment without automated decision-making.

**Goal:** Track what you do and help think with the data, not make hidden assumptions.

---

## Problem Statement

Security symbols appear in multiple forms across different contexts:

### Variant Types

1. **Exchange Suffixes**
   - `ZJPN` vs `ZJPN.F` (currency hedged variant)
   - Same underlying security, different trading characteristics

2. **Notation Variations**
   - `U.UN` vs `U_u` (Sprott Uranium Trust)
   - `COP.UN` vs `COPu` (Sprott Copper Trust)
   - Different representations of the same security

3. **Similar But Different Securities**
   - `VUN` (Canadian ETF holding VTI + currency hedge)
   - `VTI` (US ETF, underlying of VUN)
   - Economically linked but distinct securities

4. **Factor Equivalents**
   - `DISV` ≈ `AVDV` ≈ `AVUV` (all small-cap value)
   - Different providers, similar factor exposure
   - Not identical but serve similar portfolio roles

---

## Requirements

### Must Have

1. **Explicit Mapping**
   - User defines which variants map to which canonical symbol
   - No automatic guessing or assumptions

2. **Sleeve Assignment**
   - Given a symbol from brokerage (e.g., `ZJPN.F`), determine which sleeve it belongs to
   - Primary use case: `PortfolioAggregate` needs to map holdings to sleeves

3. **Transparency**
   - Clear documentation of relationships
   - User maintains control of mappings

4. **Flexibility**
   - Support multiple relationship types (alias, similar, underlying)
   - Allow annotations explaining relationships

### Should Have

1. **Integration with Security Documents**
   - User maintains detailed documents for each security
   - Registry should reference these documents
   - Leverage existing alias tracking

2. **Multiple Names**
   - Brokerage name vs canonical symbol
   - Full name vs ticker
   - Regional variations

3. **Relationship Metadata**
   - Why are two symbols related?
   - What's the nature of the relationship?

---

## Proposed Design

### Registry Structure (YAML)

```yaml
# security-registry.yaml
securities:
  # Canonical symbol as key
  ZJPN:
    canonical: "ZJPN"
    name: "BMO Japan Index ETF"
    aliases:
      - "ZJPN.F"    # Hedged variant
    doc: "[[Stock ZJPN]]"  # Link to Obsidian document
    notes: "ZJPN.F is currency-hedged variant"

  U.UN:
    canonical: "U.UN"
    name: "Sprott Physical Uranium Trust"
    aliases:
      - "U_u"       # Notation variant
    doc: "[[Stock U.UN]]"

  VUN:
    canonical: "VUN"
    name: "Vanguard U.S. Total Market Index ETF"
    aliases: []
    related:
      - symbol: "VTI"
        relationship: "underlying"
        notes: "VUN holds VTI with CAD hedging"
    doc: "[[Stock VUN]]"

  VTI:
    canonical: "VTI"
    name: "Vanguard Total Stock Market ETF"
    aliases: []
    related:
      - symbol: "VUN"
        relationship: "wrapper"
        notes: "VUN is Canadian wrapper for VTI"
    doc: "[[Stock VTI]]"

  AVDV:
    canonical: "AVDV"
    name: "Avantis International Small Cap Value ETF"
    aliases: []
    similar:
      - symbol: "DISV"
        notes: "Both target international small-cap value"
      - symbol: "AVUV"
        notes: "AVUV is US small-cap value equivalent"
    doc: "[[Stock AVDV]]"

  PHYS:
    canonical: "PHYS"
    name: "Sprott Physical Gold Trust"
    aliases:
      - "Sprott Gold"
    doc: "[[Stock PHYS]]"
    notes: "Physical gold bullion trust"
```

### TypeScript Types

```typescript
/**
 * Relationship type between securities
 */
export type SecurityRelationship =
  | 'alias'       // Same security, different notation
  | 'underlying'  // This security is held within another
  | 'wrapper'     // This security wraps another
  | 'similar'     // Similar but not identical (factor equivalent)
  | 'hedged'      // Currency-hedged variant

/**
 * Related security metadata
 */
export interface RelatedSecurity {
  symbol: string
  relationship: SecurityRelationship
  notes?: string
}

/**
 * Security registry entry
 */
export interface SecurityRegistryEntry {
  canonical: string           // Canonical symbol for this security
  name: string               // Full official name
  aliases: string[]          // Alternative symbols (all map to canonical)
  doc?: string              // Link to documentation (Obsidian WikiLink)
  notes?: string            // General notes
  related?: RelatedSecurity[]  // Related securities
  similar?: RelatedSecurity[]  // Similar securities
}

/**
 * Complete security registry
 */
export interface SecurityRegistry {
  securities: {
    [canonicalSymbol: string]: SecurityRegistryEntry
  }
}
```

### Registry Class API

```typescript
export class SecuritySymbolRegistry {
  private registry: SecurityRegistry
  private aliasMap: Map<string, string>  // alias → canonical

  constructor(registry: SecurityRegistry) {
    this.registry = registry
    this.buildAliasMap()
  }

  /**
   * Get canonical symbol for any variant
   * Returns original if not found in registry
   */
  getCanonical(symbol: string): string {
    return this.aliasMap.get(symbol) || symbol
  }

  /**
   * Check if symbol is registered
   */
  isRegistered(symbol: string): boolean {
    return this.aliasMap.has(symbol)
  }

  /**
   * Get full registry entry for a symbol (canonical or alias)
   */
  getEntry(symbol: string): SecurityRegistryEntry | null {
    const canonical = this.getCanonical(symbol)
    return this.registry.securities[canonical] || null
  }

  /**
   * Get all aliases for a canonical symbol
   */
  getAliases(canonicalSymbol: string): string[] {
    const entry = this.registry.securities[canonicalSymbol]
    return entry?.aliases || []
  }

  /**
   * Get related securities
   */
  getRelated(symbol: string): RelatedSecurity[] {
    const entry = this.getEntry(symbol)
    return entry?.related || []
  }

  /**
   * Get similar securities
   */
  getSimilar(symbol: string): RelatedSecurity[] {
    const entry = this.getEntry(symbol)
    return entry?.similar || []
  }

  /**
   * Build reverse lookup map (alias → canonical)
   */
  private buildAliasMap(): void {
    this.aliasMap = new Map()

    for (const [canonical, entry] of Object.entries(this.registry.securities)) {
      // Map canonical to itself
      this.aliasMap.set(canonical, canonical)

      // Map each alias to canonical
      for (const alias of entry.aliases) {
        this.aliasMap.set(alias, canonical)
      }
    }
  }
}
```

---

## Integration with PortfolioAggregate

### Usage in addHolding()

```typescript
export class PortfolioAggregate {
  private symbolRegistry: SecuritySymbolRegistry

  constructor(
    sleevesConfig: SleevesConfig,
    allocations: AllocationsConfig,
    exchangeRate: number,
    symbolRegistry: SecuritySymbolRegistry,  // NEW
  ) {
    // ...
    this.symbolRegistry = symbolRegistry
  }

  addHolding(
    personName: string,
    accountName: string,
    holding: HoldingInput,
  ): void {
    // Normalize symbol to canonical form
    const canonicalSymbol = this.symbolRegistry.getCanonical(holding.symbol)

    // Store with both original and canonical
    const normalized: NormalizedHolding = {
      ...holding,
      person: personName,
      account: accountName,
      originalSymbol: holding.symbol,    // Keep original
      canonicalSymbol: canonicalSymbol,  // Use for sleeve lookup
      // ...
    }

    // Use canonical for storage key
    const key = `${personName}:${accountName}:${canonicalSymbol}`
    this.holdings.set(key, normalized)
  }

  /**
   * Filter holdings by sleeve using canonical symbols
   */
  private filterHoldingsBySleeve(
    holdings: NormalizedHolding[],
    sleeveName: string,
  ): NormalizedHolding[] {
    const sleeve = this.sleevesConfig.sleeves[sleeveName]
    if (!sleeve) return []

    const sleeveSymbols = new Set(Object.keys(sleeve.weights))

    // Match using canonical symbols
    return holdings.filter((h) =>
      sleeveSymbols.has(h.canonicalSymbol)
    )
  }
}
```

---

## Maintenance Workflow

### 1. Maintaining Registry

**When adding new security:**
```yaml
NEWSTOCK:
  canonical: "NEWSTOCK"
  name: "New Stock Company Inc."
  aliases: []
  doc: "[[Stock NEWSTOCK]]"
```

**When discovering alias:**
```yaml
ZJPN:
  canonical: "ZJPN"
  # ... existing fields ...
  aliases:
    - "ZJPN.F"    # Add newly discovered variant
```

### 2. Sync with Obsidian Documents

**In Obsidian security document:**
```markdown
---
title: Stock ZJPN
aliases:
  - ZJPN.F
  - BMO Japan Index ETF
canonical: ZJPN
---

# Stock ZJPN

Currency-hedged Japanese equity exposure via BMO.

## Variants

- **ZJPN** - Base symbol
- **ZJPN.F** - Hedged variant (what we hold)
```

**Extract to registry:**
- Script reads Obsidian documents
- Generates `security-registry.yaml`
- Or manually maintain registry and reference docs

### 3. Validation

**Check for conflicts:**
```bash
# Verify no alias appears for multiple securities
deno run validate-registry.ts security-registry.yaml
```

**Verify sleeve coverage:**
```bash
# Check if all sleeve securities are in registry
deno run check-sleeve-coverage.ts sleeves.yaml security-registry.yaml
```

---

## Open Questions

### 1. Similar vs Related

**Question:** How to handle securities that are "similar" (AVDV ≈ DISV) but not aliases?

**Options:**
- A) Track as `similar` relationship (proposed above)
- B) Don't track at all (out of scope for symbol mapping)
- C) Track in separate "factor equivalents" registry

**Recommendation:** Option A - track as `similar` for documentation, but don't use for automatic substitution.

### 2. Multiple Canonical Forms

**Question:** What if a security has multiple valid canonical forms?

**Example:** `U.UN` vs `U_u` - which is canonical?

**Recommendation:** Choose one (e.g., exchange's official form) and stick with it. Document the choice in `notes`.

### 3. Registry Location

**Question:** Where should the registry live?

**Options:**
- A) In calculator package (`security-registry.yaml`)
- B) In Obsidian vault (generated from security documents)
- C) Separate package/repository

**Recommendation:** Start with Option B (Obsidian vault is source of truth), provide import method in calculator.

### 4. Brokerage-Specific Names

**Question:** Should we track brokerage-specific display names?

**Example:** Brokerage shows "Sprott Gold" but symbol is "PHYS"

**Recommendation:** Yes, include in `aliases` or add separate `brokerageNames` field.

### 5. Automatic vs Manual Mapping

**Question:** Should registry be required or optional?

**Recommendation:** Optional - if not provided, symbols pass through unchanged. Registry only needed when variants exist.

---

## Implementation Phases

### Phase 1: Core Registry (Minimal)
- [ ] Define `SecurityRegistry` types
- [ ] Implement `SecuritySymbolRegistry` class
- [ ] Support canonical + aliases only
- [ ] Optional constructor parameter in `PortfolioAggregate`

### Phase 2: Relationships
- [ ] Add `related` and `similar` fields
- [ ] Track relationship types
- [ ] Query methods for relationships

### Phase 3: Obsidian Integration
- [ ] Extract registry from Obsidian documents
- [ ] Validation scripts
- [ ] Coverage checking

### Phase 4: Advanced Features
- [ ] Brokerage-specific names
- [ ] Historical symbol changes
- [ ] Merger/acquisition tracking

---

## Example Usage

```typescript
// Load registry (optional)
const registryYaml = await Deno.readTextFile('./security-registry.yaml')
const registry = parseSecurityRegistry(registryYaml)
const symbolRegistry = new SecuritySymbolRegistry(registry)

// Create aggregate with registry
const aggregate = new PortfolioAggregate(
  sleevesConfig,
  allocations,
  1.36,
  symbolRegistry  // Optional
)

// Add holdings - symbols normalized automatically
snapshot.holdings.forEach(holding => {
  aggregate.addHolding('Renoir', 'RRSP', holding)
  // If holding.symbol is "ZJPN.F", stored as "ZJPN"
})

// Query registry
const canonical = symbolRegistry.getCanonical('ZJPN.F')  // Returns "ZJPN"
const entry = symbolRegistry.getEntry('ZJPN')
console.log(entry.name)  // "BMO Japan Index ETF"
console.log(entry.doc)   // "[[Stock ZJPN]]"
```

---

## Related Files

- `PLAN_PORTFOLIO_AGGREGATOR.md` - Portfolio aggregate design
- `DATA_FILE_FORMATS.md` - File format specifications
- User's Obsidian vault - Security documents with aliases
- `Sleeves-YAML.md` - Sleeve definitions

---

## Decision Log

**Date: 2024-12-24**
- Decided to use YAML for registry format
- Registry is optional (not required for basic usage)
- Track aliases, related, and similar securities
- Canonical symbol chosen by user (document in notes)
- Integration point: `PortfolioAggregate` uses registry for symbol normalization
