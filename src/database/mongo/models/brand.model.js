// MongoDB Schema
const { Schema } = require('mongoose')

// Base model
const BaseModel = require('./internals/model-base')

class Brand extends BaseModel {
  constructor() {
    super()

    // Enable soft delete
    this.softDelete = true

    // Schema name
    this.schemaName = 'brand'

    // Definition
    this.schemaDefinition = new Schema({
      name: String,
      description: {
        type: String,
        default: ''
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

    // Define virtual fields
    this.schemaDefinition.virtual('numProducts', {
      ref: 'ProductSchema',
      localField: '_id',
      foreignField: 'brand',
      count: true
    })
    this.schemaDefinition.virtual('products', {
      ref: 'ProductSchema',
      localField: '_id',
      foreignField: 'brand',
      justOne: false
    })

    // Set virtuals
    this.schemaDefinition.set('toJSON', { virtuals: true })
    this.schemaDefinition.set('toObject', { virtuals: true })

    // Schema configuration
    this._configureSchema()
  }
}

module.exports = new Brand()
