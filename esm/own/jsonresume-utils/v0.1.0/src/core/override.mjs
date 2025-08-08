// Pure web platform logic - HTTP URLs only via fetch()

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
} from './merge.mjs'

/**
 * @typedef {import('jsonresume-from-yaml').ResumeInterface} JSONResume
 */

/**
 * Load and parse YAML from HTTP URLs only
 * @param {string|string[]} urls - HTTP URLs to try
 * @returns {Promise<any>}
 */
const getAndParseYaml = async (urls) => {
  if (!Array.isArray(urls)) {
    urls = [urls]
  }
  const yamlResponse = await getFirstSuccessfulResponse(urls)
  const yamlText = await yamlResponse.text()
  const parsed = parse(yamlText)
  return parsed
}

/**
 * Load and merge JSONResume YAML files with override support (Web Platform)
 * @param {string} urlToYamlSourceOverride - HTTP URL to the override YAML file
 * @param {string[]} [urlToYamlSourceBase] - Optional array of fallback HTTP URLs for base YAML
 * @returns {Promise<JSONResume>}
 */
export const getJsonResumeOverrideWith = async (
  urlToYamlSourceOverride,
  urlToYamlSourceBase,
) => {
  // Step 1: Load the override YAML
  const overrideYaml = await getAndParseYaml(urlToYamlSourceOverride)

  // Step 2: Check if override YAML has meta.override.yaml directive
  const overrideDirective = overrideYaml?.meta?.override?.yaml

  if (overrideDirective) {
    // Scenario 1: Self-contained override system
    // Use the directive URL as base, current YAML content as overrides
    const baseYaml = await getAndParseYaml(overrideDirective)
    const { meta, ...overrideData } = overrideYaml

    return mergeJsonResume(overrideData, baseYaml)
  }

  if (urlToYamlSourceBase && urlToYamlSourceBase.length > 0) {
    // Scenario 2: Standard override with fallback bases
    const baseYaml = await getAndParseYaml(urlToYamlSourceBase)

    return mergeJsonResume(overrideYaml, baseYaml)
  }

  // Scenario 3: No override, no base - return as-is
  return overrideYaml
}
