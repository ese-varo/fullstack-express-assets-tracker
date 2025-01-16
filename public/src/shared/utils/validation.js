export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  nameMinLength: 3,
  password: {
    minLength: 8,
    uppercase: /[A-Z]/,
    numbers: /[0-9]/
  },
  alphanumeric: /^[a-zA-Z0-9]+$/,
  asset: {
    modelMinLength: 2,
    modelMaxLength: 50,
    serialMaxLength: 30,
    assetIdMaxLength: 20,
    locationMinLength: 2,
    locationMaxLength: 100,
    commentsMaxLength: 500
  }
}

export const assetTypes = [
  'laptop',
  'smartphone',
  'mouse',
  'keyboard',
  'monitor',
  'headset',
  'other'
]

export const assetErrors = {
  required: field => `${field} is required`,
  alphanumeric: field => `${field} must contain only letters and numbers`,
  length: (field, min, max) => `${field} must be between ${min} and ${max} characters`,
  invalidType: 'Please select a valid asset type'
}

export const passwordErrors = {
  required: 'Password is required',
  minLength: `Password must be at least ${patterns.password.minLength} characters`,
  uppercase: 'Password must contain at least one uppercase letter',
  numbers: 'Password must contain at least one number',
  unmatched: 'Passwords do not match',
  confirmation: 'Please confirm your password'
}

export const emailErrors = {
  required: 'Email is required',
  invalid: 'Email is invalid'
}

export const nameErrors = {
  required: (prefix) => `${prefix} Name is required`,
  minLength: (prefix) => `${prefix} Name must be at least ${patterns.nameMinLength} characters`
}
