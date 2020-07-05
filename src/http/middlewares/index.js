// Available middlewares
const rulesMiddleware = require('./rules.middleware')
const authMiddleware = require('./auth.middleware')
const objectIdValidation = require('./object-id-validation.middleware')

module.exports = {
  rulesMiddleware,
  authMiddleware,
  objectIdValidation
}
