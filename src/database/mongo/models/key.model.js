// MongoDB Schema
const { Schema } = require('mongoose')

// Base model
const BaseModel = require('./internals/model-base')

class Key extends BaseModel {
  constructor() {
    super()

    // Schema name
    this.schemaName = 'key'

    // Definition
    this.schemaDefinition = new Schema({
      name: String,
      privateKey: String,
      publicKey: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    })

    // Schema configuration
    this._configureSchema()
  }
}

module.exports = new Key()
