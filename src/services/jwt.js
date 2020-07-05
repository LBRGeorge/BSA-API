// Node RSA
const NodeRSA = require('node-rsa')

// JsonWebToken
const jwt = require('jsonwebtoken')

// Config
const { jwt: jwtConfig } = require('@config')

// Database
const { Mongo } = require('@database')

// Utils
const { logger, constants: { Color } } = require('@utils')

/**
 * Just create the keys if doesn't exists :P
 */
const init = () => getKeyPair()

/**
 * Get RSA keys pairs
 * 
 */
const getKeyPair = async () => {
  const { Models: { KeySchema } } = Mongo
  const KeyModel = KeySchema.Model() // Load model

  // Check if keys exists
  let keys = await KeyModel.findOne({
    name: 'jwt'
  })

  // If keys does not exists, create them!
  if (!keys) {
    logger('Generating JWT keys pairs...', Color.FgYellow)

    const rsa = new NodeRSA({ b: 256 })
    const keyPair = rsa.generateKeyPair()

    const privateKey = keyPair.exportKey('pkcs1-private')
    const publicKey = keyPair.exportKey('pkcs1-public')

    keys = KeyModel.create({
      name: 'jwt',
      privateKey,
      publicKey
    })

    logger('JWT keys pairs were generated!', Color.FgGreen)
  }

  return {
    privateKey: keys.privateKey,
    publicKey: keys.publicKey
  }
}

/**
 * Sign a new JWT token for usage
 * 
 * @param {Object} payload
 * @param {String} payload.objectId
 * @param {String} payload.email
 */
const jwtSign = async (payload = { objectId, email }) => {
  const { privateKey } = await getKeyPair()

  const token = jwt.sign(payload, privateKey, jwtConfig)
  return token
}

/**
 * Verify a JWT token
 * 
 * @param {String} token 
 */
const jwtVerify = async (token) => {
  const { publicKey } = await getKeyPair()

  const payload = jwt.verify(token, publicKey, jwtConfig)
  return payload
}

module.exports = {
  init,

  jwtSign,
  jwtVerify
}
