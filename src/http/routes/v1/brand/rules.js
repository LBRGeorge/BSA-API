module.exports = [
  {
    request: '/v1/brand',
    body: [
      { name: 'name', required: true, type: String },
      { name: 'description', default: '' }
    ]
  }
]
