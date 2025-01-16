export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
export const capitalizeWords = (str) => str.split(' ').map(word => capitalize(word)).join(' ')
