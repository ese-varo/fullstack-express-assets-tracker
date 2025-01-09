export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  nameMinLength: 3,
  password: {
    minLength: 8,
    uppercase: /[A-Z]/,
    numbers: /[0-9]/
  }
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
