const { Color } = require('./constants')
const moment = require('moment')

/**
 * Pretty logging console
 * 
 * @param {String} text
 * @param {Color} color
 */
module.exports = (text, color = Color.Reset) => {
  const datetime = moment().format("HH:mm:ss")
  console.log(`${color}[${datetime}] ${text}${Color.Reset}`)
}
