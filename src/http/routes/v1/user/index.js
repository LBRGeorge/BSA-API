// Router
const router = require('express').Router()

// sha256
const sha256 = require('sha256')

// UUID
const TokenGenerator = require('uuid-token-generator')

// Database
const { Mongo } = require('@database')
const { Models: { UserSchema } } = Mongo

// Jwt
const { jwt: { jwtSign } } = require('@services')

// Middelwares
const { rulesMiddleware } = require('@http/middlewares')
const requestRules = require('./rules')
router.use((req, res, next) => rulesMiddleware(req, res, next, requestRules))

/**
 * Handle user token, refresh or create, same thing :P
 * 
 * @param {Object} user 
 */
const userTokenHanlder = async (user) => {
  // Token generator
  const tokenGen = new TokenGenerator(512, TokenGenerator.BASE71)

  // Generate a refresh token
  const refreshToken = tokenGen.generate()

  // Generate an access token
  const accessToken = await jwtSign({ objectId: user._id })

  // Update user refresh token
  await user.updateOne({
    refreshToken
  })

  return {
    refreshToken,
    accessToken
  }
}

/**
 * Register a new user
 */
router.put('/register', async (req, res) => {
  const { name, email, password } = req.body
  const User = UserSchema.Model()

  // Token generator
  const tokenGen = new TokenGenerator(512, TokenGenerator.BASE71)

  // Generate a refresh token
  const refreshToken = tokenGen.generate()

  // Create new user in database
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    refreshToken,
    password: sha256(password)
  })

  // Generate an access token
  const accessToken = await jwtSign({ objectId: user._id })

  res.json({
    accessToken,
    refreshToken,
    user: {
      name: user.name,
      email: user.email
    }
  })
})

/**
 * User login, that's it hahaha
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const User = UserSchema.Model()

  const user = await User.findOne({
    email: email.toLowerCase(),
    password: sha256(password)
  })
  if (!user) {
    return res.status(403).json({
      error: 'invalid_email_password'
    })
  }

  // Generate new tokens for user
  const { accessToken, refreshToken } = await userTokenHanlder(user)

  res.json({
    accessToken,
    refreshToken,
    user: {
      name: user.name,
      email: user.email
    }
  })
})

/**
 * Renew user accessToken by using refreshToken
 */
router.get('/renew/:token', async (req, res) => {
  const { token } = req.params
  const User = UserSchema.Model()

  // Attempt to get user by refreshToken
  const user = await User.findOne({
    refreshToken: token
  })
  if (!user) {
    return res.status(404).json({
      error: 'invalid_token'
    })
  }

  // Generate new tokens for user
  const { accessToken, refreshToken } = await userTokenHanlder(user)

  res.json({
    accessToken,
    refreshToken
  })
})

module.exports = router
