// Export all models schemas
module.exports = {
  // Key pairs for jwt validation
  KeySchema: require('./key.model'),

  // API Models :P
  UserSchema: require('./user.model'),
  CategorySchema: require('./category.model'),
  BrandSchema: require('./brand.model'),
  ProductSchema: require('./product.model')
}
