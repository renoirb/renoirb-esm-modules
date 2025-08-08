/**
 * Enforce JSONResume basics data structure.
 */

export const BASICS_REQUIRED_KEYS = new Set([
  'email',
  'label',
  'name',
  'summary',
  'url',
])

export const BASICS_OPTIONNAL_KEYS = new Set([
  'email',
  'image',
  'location',
  'url',
])

export const BASICS_LOCATION_REQUIRED_KEYS = new Set([
  'city',
  'countryCode',
  'region',
  //'address',
  //'postalCode',
])

const extractEnforceNonEmptyObjectKeys = (obj) => {
  if (!obj || typeof obj !== 'object') {
    const message = 'Invalid argument, must be an object. Received: ' + obj
    throw new Error(message)
  }
  const keys = Object.keys(obj)
  if (keys.length === 0) {
    const message = 'Invalid argument, must have at least one key. Received: ' + obj
    throw new Error(message)
  }
  return keys
}

export const checkRequiredKeysOfBasics = (basics) => {
  const keys = extractEnforceNonEmptyObjectKeys(basics)
  return [...BASICS_REQUIRED_KEYS].filter((k) => !keys.includes(k));
}

export const checkKeysOfBasicsLocation = (location) => {
  const keys = extractEnforceNonEmptyObjectKeys(location)
  return [...BASICS_LOCATION_REQUIRED_KEYS].filter((k) => !keys.includes(k));
}

export const assertIsContextRequestJsonResumeBasics = (basics) => {
  let message = 'Invalid ContextRequest_JsonResume_Basics payload.'
  const basicsMissingRequiredKeys = checkRequiredKeysOfBasics(basics)
  if (basicsMissingRequiredKeys && basicsMissingRequiredKeys?.length > 0) {
    message += ` Missing required keys: ${basicsMissingRequiredKeys.join(', ')}.`
    throw new Error(message)
  }
  if (Reflect.has(basics,'location')) {
    checkKeysOfBasicsLocation(basics.location)
  }
}

export const stringifyBasicsLocation = (basics) => {
  assertIsContextRequestJsonResumeBasics(basics)
  const { location } = basics
  const {
    // address,
    // postalCode,
    city,
    countryCode,
    region,
  } = location || {}
  const stringifiedLocation = [city, region, countryCode].filter(Boolean)
  if (stringifiedLocation.length === 0) {
    return ''
  }
  return stringifiedLocation.join(', ')
}
