// Libaries
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')

// Config
const { http } = require('@config')

// Routes
const routes = require('./routes')

// Body raw parsing
const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
}

class Http {
  /**
   * Initialize HTTP server
   * @returns {Http}
   */
  async init() {
    // Initialize express
    this.app = express()
    this.app.listen(http.port)

    // Configure logging
    this.app.use(morgan('common', { // access log
      stream: fs.createWriteStream(http.logging.access, { flags: 'a' })
    }))
    this.app.use(morgan('common', { // error log
      skip: function (req, res) { return res.statusCode < 400 },
      stream: fs.createWriteStream(http.logging.error, { flags: 'a' })
    }))
    
    // Parse body to json
    this.app.use(bodyParser.json({ verify: rawBodyBuffer }))

    // Cors setup
    this.app.use(cors({ exposedHeaders: 'Authorization' }))
    this.app.options('*', cors({ exposedHeaders: 'Authorization' }))

    // Routing
    this.app.use('/', routes)

    return this
  }
}

module.exports = new Http()
