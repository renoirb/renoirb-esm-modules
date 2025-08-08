// Deno-specific logic - supports both HTTP URLs and local files

import {
  /*                    */
  parse,
} from '@dep/yaml'

import {
  /*                    */
  getFirstSuccessfulResponse,
} from '@renoirb/http-utils'

import {
  /*                    */
  mergeJsonResume,
} from '../core/merge.mjs'

/**
 * @typedef {import('jsonresume-from-yaml').ResumeInterface} JSONResume
 */

/**
 * Load content from HTTP URL or local file
 * @param {string} urlOrPath - HTTP URL or local file path
 * @returns {Promise<string>}
 */
const loadContent = async (urlOrPath) => {
  // Check if it's an HTTP URL
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    const response = await getFirstSuccessfulResponse([urlOrPath])
    return await response.text()
  }

  // Otherwise treat as local file path
  try {
    return await Deno.readTextFile(urlOrPath)
  } catch (error) {
    throw new Error(`Failed to read file: ${urlOrPath} - ${error.message}`)
  }
}

/**
 * Load and parse YAML from HTTP URL or local file
 * @param {string} urlOrPath - HTTP URL or local file path
 * @returns {Promise<any>}
 */
const getAndParseYaml = async (urlOrPath) => {
  const yamlText = await loadContent(urlOrPath)
  const parsed = parse(yamlText)
  return parsed
}

/**
 * Load and merge JSONResume YAML files with override support (Deno CLI)
 * @param {string} baseUrlOrPath - HTTP URL or local path to the base YAML file
 * @param {string} overridePath - Local path to the override YAML file (being edited)
 * @returns {Promise<JSONResume>}
 */
export const getJsonResumeOverrideWith = async (
  baseUrlOrPath,
  overridePath,
) => {
  // Step 1: Load the override YAML (local file being edited)
  const overrideYaml = await getAndParseYaml(overridePath)

  // Step 2: Check if override YAML has meta.override.yaml directive
  const overrideDirective = overrideYaml?.meta?.override?.yaml

  if (overrideDirective) {
    // Scenario 1: Self-contained override system
    // Use the directive URL as base, ignore the baseUrlOrPath argument
    const baseYaml = await getAndParseYaml(overrideDirective)
    const { meta, ...overrideData } = overrideYaml

    return mergeJsonResume(overrideData, baseYaml)
  }

  // Scenario 2: Standard CLI override
  // Use provided base and override files
  const baseYaml = await getAndParseYaml(baseUrlOrPath)

  return mergeJsonResume(overrideYaml, baseYaml)
}
