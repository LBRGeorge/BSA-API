// Load envs
require('dotenv').config()
const App = require('./src/app')

(async() => await App())
