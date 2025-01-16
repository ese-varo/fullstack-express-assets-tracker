import {
  patterns as p,
  emailErrors,
  passwordErrors,
  nameErrors,
  assetErrors,
  assetTypes
} from './validation.js'

export const validateAlphanumeric = (value, field, maxLength) => {
  if (!value) return assetErrors.required(field)
  if (!p.alphanumeric.test(value)) return assetErrors.alphanumeric(field)
  if (value.length > maxLength) return assetErrors.length(field, 1, maxLength)
  return null
}

export const validateSignupField = (name, value, formData) => {
  switch(name) {
    case 'firstName':
      return validateName(value, 'First')
      break
    case 'lastName':
      return validateName(value, 'Last')
      break
    case 'email':
      return validateEmail(value)
      break
    case 'password':
      return validatePassword(value)
      break
    case 'confirmPassword':
      return validateConfirmPassword(value, formData.password)
      break
  }
  return ''
}

export const validateLoginField = (name, value) => {
  if (name === 'email') return validateEmail(value)
  else if (name === 'password') return validatePassword(value)
}

export const validateAssetField = (name, value) => {
  switch(name) {
    case 'model':
      if (!value) return assetErrors.required('Model')
      if (value.length < p.asset.modelMinLength || value.length > p.asset.modelMaxLength)
        return assetErrors.length('Model', p.asset.modelMinLength, p.asset.modelMaxLength)
      return null

    case 'serialNumber':
      return validateAlphanumeric(value, 'Serial number', p.asset.serialMaxLength)

    case 'type':
      if (!value) return assetErrors.required('Type')
      if (!assetTypes.includes(value))
        return assetErrors.invalidType
      return null

    case 'assetId':
      return validateAlphanumeric(value, 'Asset ID', p.asset.assetIdMaxLength)

    case 'location':
      if (!value) return assetErrors.required('Location')
      if (value.length < p.asset.locationMinLength || value.length > p.asset.locationMaxLength)
        return assetErrors.length('Location', p.asset.locationMinLength, p.asset.locationMaxLength)
      return null

    case 'comments':
      if (value && value.length > p.asset.commentsMaxLength)
        return assetErrors.length('Comments', 0, p.asset.commentsMaxLength)
      return null
  }
  return null
}

export const validateEmail = (value) => {
  if (!value) return emailErrors.required
  else if (!p.email.test(value)) return emailErrors.invalid
  return null
}

export const validatePassword = (value) => {
  if (!value) return passwordErrors.required
  else if (value.length < p.password.minLength)
    return passwordErrors.minLength
  else if (!p.password.uppercase.test(value))
    return passwordErrors.uppercase
  else if (!p.password.numbers.test(value)) return passwordErrors.numbers
  return null
}

export const validateName = (value, prefix) => {
  if (!value) return nameErrors.required(prefix)
  else if (value.length < p.nameMinLength)
    return nameErrors.minLength(prefix)
  return null
}

export const validateConfirmPassword = (value, password) => {
  if (!value) return passwordErrors.confirmation
  else if (value !== password) return passwordErrors.unmatched
}
