// Router
const router = require('express').Router()

// Database
const { Mongo } = require('@database')
const { Models: { BrandSchema } } = Mongo

const { paginationParser, updateFieldsParser } = require('@helpers')

// Middelwares
const { rulesMiddleware, authMiddleware, objectIdValidation } = require('@http/middlewares')
const requestRules = require('./rules')
router.use((req, res, next) => rulesMiddleware(req, res, next, requestRules)) // Rules middelware
router.use(authMiddleware) // Authentication middleware. ONLY AUTHENTICATED USERS CAN ACCESS THIS

/**
 * List all brands available
 */
router.get('/:id?', objectIdValidation, async (req, res) => {
  const { id } = req.params
  const { noPagination, page = 1, limit = 20 } = req.query
  const Brand = BrandSchema.Model()

  // Get only one brand detail
  if (id) {
    const brand = await Brand.findById(id).populate({ path: 'products' })

    if (!brand) {
      return res.status(404).json({
        error: 'brand_not_found'
      })
    }

    return res.json({
      brand
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
    const pagination = await Brand.paginate({}, paginationOptions)
  
    return res.json(
      paginationParser('brands', pagination)
    )
  }
})

/**
 * Create a new brand
 */
router.put('/', async (req, res) => {
  const { name, description } = req.body
  const Brand = BrandSchema.Model()

  const brand = await Brand.create({
    name,
    description
  })

  return res.json({
    brand
  })
})

/**
 * Update an existing brand
 */
router.post('/:id', objectIdValidation, async (req, res) => {
  const { id } = req.params
  const { name, description } = req.body
  const Brand = BrandSchema.Model()

  let brand = await Brand.findById(id)
  if (!brand) {
    return res.status(404).json({
      error: 'brand_not_found'
    })
  }

  // Mount update fields object
  const updateFields = updateFieldsParser({
    name,
    description
  })

  // Update brand data
  await brand.updateOne({
    ...updateFields,
    updatedAt: Date.now()
  })

  // After update, we need to get the fresh new updated data here
  brand = await Brand.findById(id)

  return res.json({
    brand
  })
})

/**
 * Delete an existing brand
 */
router.delete('/:id', objectIdValidation, async (req, res) => {
  const { id } = req.params
  const Brand = BrandSchema.Model()

  const brand = await Brand.findById(id)
  if (!brand) {
    return res.status(404).json({
      error: 'brand_not_found'
    })
  }

  // Soft deletion :P
  await brand.delete()

  return res.json({
    deletedId: id
  })
})

module.exports = router
