// Routing version
const name = 'v1'

// Routes for this version
const routes = {
  '/user': require('./user'),
  '/category': require('./category'),
  '/brand': require('./brand'),
  '/product': require('./product'),
  '/dashboard': require('./dashboard'),
}

module.exports = {
  name,
  routes
}
