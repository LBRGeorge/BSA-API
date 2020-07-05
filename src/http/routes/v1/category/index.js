// Router
const router = require('express').Router()

// Database
const { Mongo } = require('@database')
const { Models: { CategorySchema } } = Mongo

const { paginationParser, updateFieldsParser } = require('@helpers')

// Middelwares
const { rulesMiddleware, authMiddleware, objectIdValidation } = require('@http/middlewares')
const requestRules = require('./rules')
router.use((req, res, next) => rulesMiddleware(req, res, next, requestRules)) // Rules middelware
router.use(authMiddleware) // Authentication middleware. ONLY AUTHENTICATED USERS CAN ACCESS THIS

/**
 * List all categories available
 */
router.get('/:id?', objectIdValidation, async (req, res) => {
  const { id } = req.params
  const { noPagination, page = 1, limit = 20 } = req.query
  const Category = CategorySchema.Model()

  // Get only one category detail
  if (id) {
    const category = await Category.findById(id).populate({ path: 'products' })

    if (!category) {
      return res.status(404).json({
        error: 'category_not_found'
      })
    }

    return res.json({
      category
    })
  } else {
    // Setup options for pagination
    const paginationOptions = {
      populate: 'numProducts',
      lean: true,
      page,
      limit
    }
  
    // Set infinity limit of items
    if (noPagination) {
      paginationOptions['pagination'] = false
    }

    // Make pagination
    const pagination = await Category.paginate({}, paginationOptions)
  
    return res.json(
      paginationParser('categories', pagination)
    )
  }

})

/**
 * Create a new category
 */
router.put('/', async (req, res) => {
  const { name, description } = req.body
  const Category = CategorySchema.Model()

  const category = await Category.create({
    name,
    description
  })

  return res.json({
    category
  })
})

/**
 * Update an existing category
 */
router.post('/:id', objectIdValidation, async (req, res) => {
  const { id } = req.params
  const { name, description } = req.body
  const Category = CategorySchema.Model()

  let category = await Category.findById(id)
  if (!category) {
    return res.status(404).json({
      error: 'category_not_found'
    })
  }

  // Mount update fields object
  const updateFields = updateFieldsParser({
    name,
    description
  })

  // Update category data
  await category.updateOne({
    ...updateFields,
    updatedAt: Date.now()
  })

  // After update, we need to get the fresh new updated data here
  category = await Category.findById(id)

  return res.json({
    category
  })
})

/**
 * Delete an existing category
 */
router.delete('/:id', objectIdValidation, async (req, res) => {
  const { id } = req.params
  const Category = CategorySchema.Model()

  const category = await Category.findById(id)
  if (!category) {
    return res.status(404).json({
      error: 'category_not_found'
    })
  }

  // Soft deletion :P
  await category.delete()

  return res.json({
    deletedId: id
  })
})

module.exports = router
