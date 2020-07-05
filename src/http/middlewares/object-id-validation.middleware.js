// Mongo
const { Mongo: { validateId } } = require('@database')

/**
 * Validate mongo object id
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const validation = (req, res, next) => {
  const { id } = req.params

  // If id was not informed, we can go
  if (!id) {
    next()
    return
  }

  // Check id validation
  if (!validateId(id)) {
    return res.status(403).json({
      error: 'invalid_object_id'
    })
  } else {
    // Gooo
    next()
  }
}

module.exports = validation
