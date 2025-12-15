/**
 * Main entry point for sleeve calculator CLI
 *
 * Usage:
 *   deno run --allow-read main.ts
 *   deno task cli
 */

export * from './src/index.ts'

if (import.meta?.main) {
  await import('./main_cli.ts')
}
