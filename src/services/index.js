// JWT Service
const jwt = require('./jwt')

/**
 * Some services requires an initialization before the API goes up
 * here we gonna initializes these services
 */
const init = async () => {
  // Initialize JWT
  await jwt.init()
}

module.exports = {
  init,

  jwt
}
