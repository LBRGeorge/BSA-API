const path = require('path')

const { 
  MONGO_DATABASE_HOST,
  MONGO_DATABASE_PORT,
  MONGO_DATABASE_NAME,
  MONGO_DATABASE_USER,
  MONGO_DATABASE_PASS,

  HTTP_SERVER_PORT,
  HTTP_ACCESS_LOG_FILE,
  HTTP_ERROR_LOG_FILE,

  JWT_ISSUER,
  JWT_SUBJECT,
  JWT_AUDIENCE,
  JWT_EXPIRES,
  JWT_ALGORITHM
} = process.env

/**
 * Default logs files
 */
const ACCESS_LOG = path.join(__dirname, '../../', 'storage/log', 'access.log')
const ERROR_LOG = path.join(__dirname, '../../', 'storage/log', 'error.log')

module.exports = {
  /**
   * Databases connections config
   */
  databases: {
    /**
     * MongoDB connection config
     */
    mongoDB: {
      connectionString: `mongodb://${MONGO_DATABASE_HOST || 'localhost'}:${MONGO_DATABASE_PORT || 27017}/${MONGO_DATABASE_NAME || 'db'}`,
      maxReconnectAttempts: 10,
      Promise: require('bluebird').Promise,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        user: MONGO_DATABASE_USER,
        pass: MONGO_DATABASE_PASS
      }
    }
  },
  /**
   * HTTP Server config
   */
  http: {
    port: HTTP_SERVER_PORT,
    logging: {
      access: HTTP_ACCESS_LOG_FILE && HTTP_ACCESS_LOG_FILE.length > 0 ? HTTP_ACCESS_LOG_FILE : ACCESS_LOG,
      error: HTTP_ERROR_LOG_FILE && HTTP_ERROR_LOG_FILE.length > 0 ? HTTP_ERROR_LOG_FILE : ERROR_LOG
    }
  },
  /**
   * JWT Config
   */
  jwt: {
    issuer: JWT_ISSUER,
    subject: JWT_SUBJECT,
    audience: JWT_AUDIENCE,
    expiresIn: JWT_EXPIRES,
    algorithm: JWT_ALGORITHM
  },
}
