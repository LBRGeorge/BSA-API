/**
 * Parser fields to be updated
 * 
 * @param {Object} acceptableFields 
 */
const parser = (acceptableFields) => {
  let obj = {}

  // Mount object
  Object.keys(acceptableFields).forEach(k => {
    const field = acceptableFields[k]
    if (field) {
      obj[k] = field
    }
  })

  return obj
}

module.exports = parser
