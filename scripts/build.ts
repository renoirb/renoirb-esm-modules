// scripts/build.ts
import { join, basename, dirname, resolve } from 'https://deno.land/std/path/mod.ts'
import { copy, emptyDir, ensureDir } from 'https://deno.land/std/fs/mod.ts'
import { parse } from 'jsonc-parser'

const DIST_ROOT = './dist'

type BuildTarget = 'http' // | 'jsr' | 'npm'

interface PackageConfig {
  name: string
  version: string
  description: string
  dependencies?: Record<string, string>
  exports?: Record<string, string>
}

type BuildOptions = {
  targets: BuildTarget[]
  typesGeneration: boolean
  minify: boolean
}

/**
 * Read package configuration from deno.json
 */
async function readPackageConfig(
  packagePath: string,
): Promise<PackageConfig> {
  try {
    const denoJsonPath = join(packagePath, 'deno.json')
    const content = await Deno.readTextFile(denoJsonPath)
    const config = parse(content);

    return {
      name: config.name || basename(packagePath),
      version: config.version || '0.1.0',
      description: config.description || '',
      dependencies: config.dependencies || {},
      exports: config.exports || {},
    };
  } catch (error) {
    console.error(`Error reading package config for ${packagePath}:`, error);
    throw error;
  }
}

/**
 * Build package for HTTP serving (CloudFlare, S3, etc.)
 */
async function buildForHTTP(
  packagePath: string,
  config: PackageConfig,
  options: BuildOptions,
): Promise<void> {
  console.log(`Building ${config.name} for HTTP serving...`)

  const packageName = basename(packagePath)
  const httpDist = join(DIST_ROOT, 'http', 'esm-modules', packageName)
  await ensureDir(httpDist)

  // Copy source .mjs files directly - we keep the original directory structure
  await copy(join(packagePath, 'src'), join(httpDist, 'src'), {
    overwrite: true
  })

  // Copy entry point files
  const entries = ['browser.mjs', 'core.mjs']
  for (const entry of entries) {
    try {
      await Deno.copyFile(join(packagePath, entry), join(httpDist, entry))
    } catch (error) {
      // It's okay if some entry files don't exist
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error
      }
    }
  }

  // Copy README and LICENSE
  for (const file of ['README.md', 'LICENSE', 'deno.json']) {
    try {
      await Deno.copyFile(join(packagePath, file), join(httpDist, file))
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error
      }
    }
  }

  // If versioned distribution is needed, also copy to a versioned directory
  if (config.version) {
    const versionedDist = join(DIST_ROOT, 'http', 'esm-modules', `${packageName}@${config.version}`)
    await ensureDir(dirname(versionedDist))
    await copy(httpDist, versionedDist, { overwrite: true })
  }
}

/**
 * Build a single package for all specified targets
 */
export async function buildPackage(
  packagePath: string,
  options: BuildOptions
): Promise<void> {
  try {
    const config = await readPackageConfig(packagePath)

    for (const target of options.targets) {
      switch (target) {
        case 'http':
          await buildForHTTP(packagePath, config, options)
          break
      }
    }

    console.log(`✓ Successfully built ${config.name}`)
  } catch (error) {
    console.error(`✗ Failed to build ${packagePath}:`, error)
    throw error
  }
}

/**
 * Build all packages in the workspace
 */
export async function buildAll(
  options: BuildOptions,
): Promise<void> {
  // Read workspace configuration from root deno.jsonc
  const rootConfig = parse(await Deno.readTextFile('./deno.jsonc'));

  // Ensure dist directory exists and is empty
  await emptyDir(DIST_ROOT)

  if (rootConfig.workspace && Array.isArray(rootConfig.workspace)) {
    for (const pkg of rootConfig.workspace) {
      await buildPackage(pkg, options)
    }
  } else {
    // If no workspace is defined, look for packages in the packages/ directory
    for await (const entry of Deno.readDir('./packages')) {
      if (entry.isDirectory) {
        await buildPackage(`./packages/${entry.name}`, options)
      }
    }
  }

  console.log('Build completed successfully!')
}

// CLI interface
if (import.meta.main) {
  const options: BuildOptions = {
    targets: ['http'],
    typesGeneration: true,
    minify: false,
  }

  // Parse command line arguments
  const args = Deno.args
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--targets':
        if (args[i + 1]) {
          options.targets = args[++i].split(',') as BuildTarget[]
        }
        break
      case '--no-types':
        options.typesGeneration = false
        break
      case '--minify':
        options.minify = true
        break
    }
  }

  try {
    await buildAll(options)
  } catch (error) {
    console.error('Build failed:', error)
    Deno.exit(1)
  }
}
