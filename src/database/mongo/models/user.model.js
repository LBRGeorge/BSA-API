// MongoDB Schema
const { Schema } = require('mongoose')

// Base model
const BaseModel = require('./internals/model-base')

class User extends BaseModel {
  constructor() {
    super()

    // Enable soft delete
    this.softDelete = true

    // Schema name
    this.schemaName = 'user'

    // Definition
    this.schemaDefinition = new Schema({
      name: String,
      email: String,
      password: String,
      refreshToken: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    })

    // Schema configuration
    this._configureSchema()
  }
}

module.exports = new User()
