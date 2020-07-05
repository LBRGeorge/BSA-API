// MongoDB Schema
const { Model: MongooseModel } = require('mongoose')

// Plugins
const SoftDelete = require('mongoose-delete')
const Paginate = require('mongoose-paginate-v2')

class Model {
  /**
   * Configure schema before it gets the model setted
   */
  _configureSchema () {
    // Soft delete enable for this schema
    if (this.softDelete) {
      this.schemaDefinition.plugin(SoftDelete, { deletedAt: true, overrideMethods: 'all' })
    }

    // Pagination for this schema
    this.schemaDefinition.plugin(Paginate)
  }

  /**
   * Internal model definition
   * 
   * @param {MongooseModel} model 
   */
  _setModel(model) {
    this._model = model
  }

  /**
   * Get model
   * 
   * @returns {MongooseModel}
   */
  Model() {
    return this._model
  }
}

module.exports = Model
