const path = require('path')
const appRouter = require('express').Router()

// All versions routes
const allRoutes = [
  require('./v1')
]

/**
 * Create all app routes here :P
 */
allRoutes.forEach(route => {
  const { name, routes } = route

  Object.keys(routes).forEach(key => {
    const _route = routes[key]
    appRouter.use(path.join('/', name, key), _route.bind(this))
  })
})

module.exports = appRouter
