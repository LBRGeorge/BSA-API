module.exports = [
  {
    request: '/v1/category',
    body: [
      { name: 'name', required: true, type: String },
      { name: 'description', default: '' }
    ]
  }
]
