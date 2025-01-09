import {
  patterns,
  emailErrors,
  passwordErrors,
  nameErrors
} from './validation.js'

export const validateEmail = (value) => {
  if (!value) return emailErrors.required
  else if (!patterns.email.test(value)) return emailErrors.invalid
  return null
}

export const validatePassword = (value) => {
  if (!value) return passwordErrors.required
  else if (value.length < patterns.password.minLength)
    return passwordErrors.minLength
  else if (!patterns.password.uppercase.test(value))
    return passwordErrors.uppercase
  else if (!patterns.password.numbers.test(value)) return passwordErrors.numbers
  return null
}

export const validateName = (value, prefix) => {
  if (!value) return nameErrors.required(prefix)
  else if (value.length < patterns.nameMinLength)
    return nameErrors.minLength(prefix)
  return null
}

export const validateConfirmPassword = (value, password) => {
  if (!value) return passwordErrors.confirmation
  else if (value !== password) return passwordErrors.unmatched
}
