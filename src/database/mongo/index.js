// MongooseJS
const mongoose = require("mongoose")

// sha256
const sha256 = require('sha256')

// Models
const Models = require('./models')

// Config
const { databases: { mongoDB } } = require('@config')

// Utils
const { logger, constants: { Color } } = require('@utils/')

// Reconnect config
const MAX_RECONNECT_ATTEMPTS = mongoDB.maxReconnectAttempts
let CURRENT_RECONNECT_ATTEMPTS = 0

// Wrapper promise
mongoose.Promise = mongoDB.Promise

// Connection instance
let DATABASE = mongoose.connection

/**
 * MongoDB initialize connection
 */
const init = async () => {
  try {
    // Connect
    await mongoose.connect(mongoDB.connectionString, mongoDB.options)

    // Get db
    DATABASE = mongoose.connection

    // Handle connection error
    DATABASE.on('error', error => {
      if (error.name && error.name === 'MongoNetworkError') {
        reconnect()
      } else {
        throw error
      }
    })

    // Load models
    loadModels()

    // Create default records
    await createDefaultRecords()

    logger('MongoDB connected!', Color.FgGreen)
    return DATABASE
  } catch (error) {
    if (error.name && error.name === 'MongoNetworkError') {
      reconnect()
    } else {
      throw error
    }
  }
}

/**
 * MongoDB reconnect
 */
const reconnect = () => {
  if (CURRENT_RECONNECT_ATTEMPTS < MAX_RECONNECT_ATTEMPTS) {
    CURRENT_RECONNECT_ATTEMPTS++

    logger('Could not reach MongoDB! Retrying in 5 secs...', Color.FgRed)
    setTimeout(() => {
      init()
    }, 5000)
  } else {
    logger('Could not connect to MongoDB. Please check if all services is working and restart the API.')
  }
}

/**
 * Load all mongo models
 */
const loadModels = () => {
  Object.keys(Models).forEach(key => {
    const schema = Models[key]

    // Define model
    const model = DATABASE.model(key, schema.schemaDefinition, schema.schemaName.toLowerCase())
 
    // Save model instance
    schema._setModel(model)

    // Sync model
    model.syncIndexes()
  })
}

/**
 * Validate object id
 * 
 * @param {String} id 
 */
const validateId = (id) => mongoose.Types.ObjectId.isValid(id)

/**
 * Create default records
 * We need some data for our system gets usable. Such as a default user or default permissions
 */
const createDefaultRecords = async () => {
  const { UserSchema } = Models
  const UserModel = UserSchema.Model()

  // Does we have already any user created?
  const usersCount = await UserModel.countDocuments()
  if (usersCount === 0) {
    logger('No users were found. Creating default user...', Color.FgYellow)
    
    await UserModel.create({
      name: 'User Default',
      email: 'user@localhost',
      password: sha256('123456')
    })

    logger(`========================`, Color.FgGreen)
    logger(`User default created! There is below the default credentials`, Color.FgGreen)
    logger(`Email: user@localhost`, Color.FgGreen)
    logger(`Password: 123456`, Color.FgGreen)
    logger(`========================`, Color.FgGreen)
  }
}

module.exports = {
  DATABASE,
  Models,
  init,
  validateId
}

