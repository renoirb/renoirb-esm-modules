# Distribute release packaging and publishing

## Status

💭 **FUTURE** - Specification in progress for multiple distribution variants

**Phase:** Writing specs for bundling and distribution strategies
**Priority:** Medium - Future enhancement after core features
**Dependencies:** Package already published to JSR successfully

**Planned Variants:**
- CLI standalone binary (via `deno compile`)
- Client-side web form (backend-less, offline-capable browser application)
- Obsidian integration (visualize weights and amounts within Obsidian vault)
- Additional formats TBD

## Summary

Continuation of `./PLAN_PUBLISH_AS_PART_OF_RENOIR_ESM_MODULES.md` - exploring CLI bundling, web applications, and additional distribution methods beyond JSR.

## Details

### dist.renoirb.com

> [!info] **TODO**
> Find a way to:
> - "slurp" files from JSR that has transpiled, and mirror as a folder.


### Standalone binary

> [!info] **TODO**
> Find a way to
> - get all supported `deno compile` output target to run and 
> - systematically write output to predictable directory path we can purge
> - package compressed archivel; to pick files (equivalent of `package.json` or to attach a version from binary default command), README.md for this, etc.

Using `deno task compile`

```bash
❯ deno task compile

Task compile:aarch64-apple-darwin deno compile --no-check --target aarch64-apple-darwin --output dist/bin/aarch64-apple-darwin/calculator deno.ts
Compile deno.ts to dist/bin/aarch64-apple-darwin/calculator

Embedded Files

calculator
└─┬ packages (58.14KB)
  └─┬ investing-sleeve-calculator (58.14KB)
    ├── core.ts (208B)
    ├── deno.ts (16.19KB)
    └─┬ src (41.75KB)
      ├── calculator.ts (16.2KB)
      ├── drift.ts (8.43KB)
      ├── index.ts (1.16KB)
      ├── sleeves.examples.ts (12.82KB)
      └── types.ts (3.14KB)

Files: 64.86KB
Metadata: 5.9KB
Remote modules: 261.88KB



Task compile:aarch64-unknown-linux-gnu deno compile --no-check --target aarch64-unknown-linux-gnu --output dist/bin/aarch64-unknown-linux-gnu/calculator deno.ts
Compile deno.ts to dist/bin/aarch64-unknown-linux-gnu/calculator

Embedded Files

calculator
└─┬ packages (58.14KB)
  └─┬ investing-sleeve-calculator (58.14KB)
    ├── core.ts (208B)
    ├── deno.ts (16.19KB)
    └─┬ src (41.75KB)
      ├── calculator.ts (16.2KB)
      ├── drift.ts (8.43KB)
      ├── index.ts (1.16KB)
      ├── sleeves.examples.ts (12.82KB)
      └── types.ts (3.14KB)

Files: 64.86KB
Metadata: 5.9KB
Remote modules: 261.88KB



Task compile:x86_64-apple-darwin deno compile --no-check --target x86_64-apple-darwin --output dist/bin/x86_64-apple-darwin/calculator deno.ts
Compile deno.ts to dist/bin/x86_64-apple-darwin/calculator

Embedded Files

calculator
└─┬ packages (58.14KB)
  └─┬ investing-sleeve-calculator (58.14KB)
    ├── core.ts (208B)
    ├── deno.ts (16.19KB)
    └─┬ src (41.75KB)
      ├── calculator.ts (16.2KB)
      ├── drift.ts (8.43KB)
      ├── index.ts (1.16KB)
      ├── sleeves.examples.ts (12.82KB)
      └── types.ts (3.14KB)

Files: 64.86KB
Metadata: 5.9KB
Remote modules: 261.88KB



Task compile:x86_64-unknown-linux-gnu deno compile --no-check --target x86_64-unknown-linux-gnu --output dist/bin/x86_64-unknown-linux-gnu/calculator deno.ts
Compile deno.ts to dist/bin/x86_64-unknown-linux-gnu/calculator

Embedded Files

calculator
└─┬ packages (58.14KB)
  └─┬ investing-sleeve-calculator (58.14KB)
    ├── core.ts (208B)
    ├── deno.ts (16.19KB)
    └─┬ src (41.75KB)
      ├── calculator.ts (16.2KB)
      ├── drift.ts (8.43KB)
      ├── index.ts (1.16KB)
      ├── sleeves.examples.ts (12.82KB)
      └── types.ts (3.14KB)

Files: 64.86KB
Metadata: 5.9KB
Remote modules: 261.88KB
```

File size per target:

```bash
❯ du -h dist/bin/aarch64-apple-darwin
 71M    dist/bin/aarch64-apple-darwin

❯ du -h dist/bin/aarch64-unknown-linux-gnu
 80M    dist/bin/aarch64-unknown-linux-gnu

❯ du -h dist/bin/x86_64-apple-darwin
 78M    dist/bin/x86_64-apple-darwin

❯ du -h dist/bin/x86_64-unknown-linux-gnu
 85M    dist/bin/x86_64-unknown-linux-gnu
```