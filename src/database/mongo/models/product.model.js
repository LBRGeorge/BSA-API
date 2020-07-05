// MongoDB Schema
const { Schema } = require('mongoose')

// Base model
const BaseModel = require('./internals/model-base')

class Product extends BaseModel {
  constructor() {
    super()

    // Enable soft delete
    this.softDelete = true

    // Schema name
    this.schemaName = 'product'

    // Definition
    this.schemaDefinition = new Schema({
      name: String,
      description: String,
      price: Number,
      quantity: Number,
      brand: {
        type: Schema.Types.ObjectId,
        ref: 'BrandSchema',
        default: null
      },
      category: {
        type: Schema.Types.ObjectId,
        ref: 'CategorySchema',
        default: null
      },
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

module.exports = new Product()
