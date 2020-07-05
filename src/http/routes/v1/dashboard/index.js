// Router
const router = require('express').Router()

// Database
const { Mongo } = require('@database')
const { Models: { ProductSchema, CategorySchema, BrandSchema } } = Mongo

// Middelwares
const { authMiddleware } = require('@http/middlewares')
router.use(authMiddleware) // Authentication middleware. ONLY AUTHENTICATED USERS CAN ACCESS THIS

/**
 * Get dashboard stats
 */
router.get('/stats', async (req, res) => {
  const Product = ProductSchema.Model()
  const Category = CategorySchema.Model()
  const Brand = BrandSchema.Model()

  // Get product total
  const productsTotal = await Product.countDocuments({})

  // Get categories total
  const categoriesTotal = await Category.countDocuments({})

  // Get brands total
  const brandsTotal = await Brand.countDocuments({})

  return res.json({
    stats: {
      productsTotal,
      categoriesTotal,
      brandsTotal
    }
  })
})

module.exports = router
