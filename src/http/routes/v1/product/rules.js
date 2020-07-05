const { Mongo: { Models } } = require('@database')
const { BrandSchema, CategorySchema } = Models

module.exports = [
  {
    request: '/v1/product',
    body: [
      { name: 'name', required: true, type: String },
      { name: 'description', default: '' },
      { name: 'price', required: true, type: Number },
      { name: 'quantity', required: true, type: Number },

      { name: 'category', required: true, type: String, exists: CategorySchema },
      { name: 'brand', type: String, exists: BrandSchema },
    ]
  }
]
