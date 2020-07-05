// Databases
const { Mongo } = require('@database')

// HTTP Server
const HTTP = require('@http')

// Services
const Services = require('@services')

// Utils
const { logger, constants: { Color } } = require('@utils')

/**
 * Initialization singleton
 */
const init = async () => {
  try {
    // Initialize Mongo database
    await Mongo.init()

    // Initialize services
    await Services.init()

    // Initialize HTTP server
    HTTP.init()

    logger('API initialized!', Color.FgGreen)
  } catch (error) {
    logger(error, Color.FgRed)
  }
}

/**
 * Defaut export
 */
module.exports = (async() => {
  await init()
})
