// Get models for validations
const { Mongo: { Models } } = require('@database')
const { UserSchema } = Models

module.exports = [
  {
    request: '/v1/user/register',
    body: [
      { name: 'name', required: true, type: String },
      { name: 'email', required: true, type: String, notExists: UserSchema },
      { name: 'password', required: true, type: String },
    ]
  },
  {
    request: '/v1/user/login',
    body: [
      { name: 'email', required: true, type: String },
      { name: 'password', required: true, type: String },
    ]
  }
]
