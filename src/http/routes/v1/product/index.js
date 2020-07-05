// Router
const router = require('express').Router()

// Database
const { Mongo } = require('@database')
const { validateId, Models: { ProductSchema, BrandSchema, CategorySchema } } = Mongo

const { paginationParser, updateFieldsParser } = require('@helpers')

// Middelwares
const { rulesMiddleware, authMiddleware, objectIdValidation } = require('@http/middlewares')
const requestRules = require('./rules')
router.use((req, res, next) => rulesMiddleware(req, res, next, requestRules)) // Rules middelware
router.use(authMiddleware) // Authentication middleware. ONLY AUTHENTICATED USERS CAN ACCESS THIS

/**
 * List all products available
 */
router.get('/:id?', objectIdValidation, async (req, res) => {
  const { id } = req.params
  const { page = 1, limit = 20, name = null, category = null } = req.query
  const Product = ProductSchema.Model()

  if (id) {
    const product = await Product.findById(id)
                        .populate([
                          {
                            path: 'brand',
                            select: ['_id', 'name', 'description']
                          },
                          {
                            path: 'category',
                            select: ['_id', 'name', 'description']
                          }
                        ])

    if (!product) {
      return res.status(404).json({
        error: 'prdouct_not_found'
      })
    }

    return res.json({
      product
    })
  } else {
    // Setup options for pagination
    const paginationOptions = {
      // Populate pagination
      populate: [
        {
          path: 'brand',
          select: ['_id', 'name', 'description']
        },
        {
          path: 'category',
          select: ['_id', 'name', 'description']
        }
      ],
  
      page,
      limit
    }

    // Setup custom query
    const query = {}

    // Filter by category
    if (category) {
      query['category'] = category
    }

    // Filter by product name
    if (name) {
      query['name'] = { $regex: '.*' + name + '.*', $options: 'i' }
    }

    // Make pagination
    const pagination = await Product.paginate(query, paginationOptions)
  
    return res.json(
      paginationParser('products', pagination)
    )
  }
})

/**
 * Create a new product
 */
router.put('/', async (req, res) => {
  const { name, description, price, quantity, brand, category } = req.body
  const Product = ProductSchema.Model()

  const product = await Product.create({
    name,
    description,
    price,
    quantity,
    brand,
    category
  })

  return res.json({
    product
  })
})

/**
 * Update an existing product
 */
router.post('/:id', objectIdValidation, async (req, res) => {
  const { id } = req.params
  const { name, description, price, quantity, brand, category } = req.body
  const Product = ProductSchema.Model()

  let product = await Product.findById(id)
  if (!product) {
    return res.status(404).json({
      error: 'product_not_found'
    })
  }

  // since we do not have sure if the refrences of brand and category was informed
  // we need to validate them only if they were really informed
  if (brand && validateId(brand)) {
    const Brand = BrandSchema.Model()

    const brandExists = await Brand.findById(brand)
    if (!brandExists) {
      return res.status(404).json({
        error: 'brand_not_found'
      }) 
    }
  }
  if (category && validateId(category)) {
    const Category = CategorySchema.Model()

    const categoryExists = await Category.findById(category)
    if (!categoryExists) {
      return res.status(404).json({
        error: 'category_not_found'
      }) 
    }
  }

  // Mount update fields object
  const updateFields = updateFieldsParser({
    name,
    description,
    price,
    quantity,
    brand,
    category
  })

  // Update product data
  await product.updateOne({
    ...updateFields,
    updatedAt: Date.now()
  })

  // After update, we need to get the fresh new updated data here
  product = await Product.findById(id)

  return res.json({
    product
  })
})

/**
 * Delete an existing product
 */
router.delete('/:id', objectIdValidation, async (req, res) => {
  const { id } = req.params
  const Product = ProductSchema.Model()

  const product = await Product.findById(id)
  if (!product) {
    return res.status(404).json({
      error: 'product_not_found'
    })
  }

  // Soft deletion :P
  await product.delete()

  return res.json({
    deletedId: id
  })
})

module.exports = router
