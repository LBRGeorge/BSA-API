const mongoose = require('mongoose')

module.exports = async (req, res, next, requestsRules = []) => {
  // That's not a GET, right?
  if (req.method !== 'GET') {
    var requestUrl = req.originalUrl
    if (requestUrl[requestUrl.length - 1] === '/') requestUrl = requestUrl.substring(0, requestUrl.length - 1)

    var request = requestsRules.find(p => p.request === requestUrl)

    if (request === undefined) next()
    else {
      // Grab body from request object
      const { body } = req
      var wrongFieldsType = []
      var missingFields = []
      var notExistsFields = []
      var existsFields = []

      // Validate fields types
      request.body
        .filter(({ name, type }) => type && body[name]) // Filter only field with type defined and which has been informed
        .map(({ name, type }) => {
          return {
            field: name,
            type
          }
        }) // Leave only field name and its type
        .forEach(({ field, type }) => {
          const _type = typeof body[field]

          // Check arrays fields
          if (type() instanceof Array && (body[field] instanceof Array) === false) {
            wrongFieldsType.push({
              [field]: 'array'
            })
          } else {
            // Check other field type
            if (typeof type() !== _type) {
              wrongFieldsType.push({
                [field]: typeof type()
              })
            }
          }
        })

      // Validate required fields
      request.body
        .map(({ name, type, required, fields }) => {
          return {
            name,
            type,
            required,
            fields
          }
        }) // Leave only the names
        .forEach(({ name, type, required, fields }) => {
          // Check if field has been passed and if it's required
          if (body[name] === undefined && required === true) {
            if (typeof body[name] === 'string' && body[name].trim().length === 0) return

            missingFields.push(name)
          }

          // Check nested object
          if (typeof body[name] === 'object' && required === true) {
            fields
              .filter(p => p.required)
              .map(p => p.name)
              .forEach(field => {
                // If we are handling an array
                if (type() instanceof Array) {
                  if (body[name].length > 0) {
                    body[name].forEach(data => {
                      if (typeof data[field] === 'string' && data[field].trim().length === 0) return

                      // Check if nested field has been passed
                      if (data[field] === undefined) {
                        missingFields.push(`${name}.*.${field}`)
                      }
                    })
                  } else {
                    // The whole array is empty, omg!!!
                    // We need to verify if the array parent isn't duplicated here, we don't want that
                    if (missingFields.indexOf(name) === -1) {
                      missingFields.push(name)
                    }
                  }
                } else {
                  // Check if nested field has been passed
                  if (body[name][field] === undefined) {
                    if (typeof body[name][field] === 'string' && body[name][field].trim().length === 0) return

                    missingFields.push(`${name}.${field}`)
                  }
                }
              })
          }
        })

      // Seems nothing goes wrong, until now...
      if (wrongFieldsType.length === 0 && missingFields.length === 0) {
        const checkExists = []
        const checkNotExists = []

        request.body
          .filter(({ name }) => body[name] !== undefined)
          .forEach(({ name, exists, notExists, fields }) => {
            // Parent has exists flag
            if (exists) {
              checkExists.push({
                name,
                value: body[name],
                schema: exists
              })
            }

            // Parent has notexists flag
            if (notExists) {
              checkNotExists.push({
                name,

                // we need the key name of the object
                // the exists verification checks by the object id
                // but the not exists checks by the schema key, any object key can be checked here
                keyName: name,

                value: body[name],
                schema: notExists
              })
            }

            // Children has exists
            if (typeof fields === 'object') {
              fields
                .filter(p => p.exists || p.notExists)
                .forEach(({ name: fieldName, exists: fieldExists, notExists: fieldNotExists }) => {
                  // Grab only fields which will be verified on the request body
                  const data = body[name].map(obj => {
                    let newObj = {}
                    Object.keys(obj).forEach(key => {
                      if (key === fieldName) {
                        newObj[key] = obj[key]
                      }
                    })
                    return newObj
                  })

                  // Save fields to be verified
                  data.forEach((obj, index) => {
                    let existence = {
                      name: `${name}${(fields instanceof Array ? `.${index}.` : '.')}${fieldName}`,
                      value: obj[fieldName]
                    }

                    if (fieldExists) {
                      existence['schema'] = fieldExists
                      checkExists.push(existence)
                    }

                    if (fieldNotExists) {
                      // we need the key name of the object
                      // the exists verification checks by the object id
                      // but the not exists checks by the schema key, any object key can be checked here
                      existence['keyName'] = fieldName

                      existence['schema'] = fieldNotExists
                      checkNotExists.push(existence)
                    }
                  })
                })
            }
          })

        // Check fields with exists validation
        for await (let exists of checkExists) {
          const { name, value, schema } = exists

          if (typeof schema.Model === 'function') {
            const model = schema.Model()

            // Check if value is a valid object id
            if (!mongoose.Types.ObjectId.isValid(value)) {
              notExistsFields.push(name)
            } else {
              const doesExists = await model.exists({
                _id: value
              })
              if (!doesExists) {
                notExistsFields.push(name)
              }
            }
          }
        }

        // Check fields with not exists validation
        for await (let notExists of checkNotExists) {
          const { name, keyName, value, schema } = notExists

          if (typeof schema.Model === 'function') {
            const model = schema.Model()

            const doesExists = await model.exists({
              [keyName]: value
            })
            if (doesExists) {
              existsFields.push(name)
            }
          }
        }

        // Set default values
        request.body
          //.filter(p => p.required === false) // Get only optional fields
          .forEach(p => {
            const { default: defaultValue, name, type, fields } = p

            // Does the field was passed?
            if (body[name] === undefined) {
              req.body[name] = defaultValue
            } else {
              // If field is an array of fields, we need set its children default values as well
              if (type && type() instanceof Array) {
                if (body[name].length > 0 && body[name] instanceof Array) {
                  fields.forEach(field => {
                    const { name: fieldName } = field

                    // Set default value
                    if (body[name][fieldName] === undefined) {
                      body[name][fieldName] = field['default']
                    }
                  })
                }
              }
            }
          })
      }


      // There's something wrong?
      if (wrongFieldsType.length > 0) {
        res.status(403).json({
          error: 'wrong_fields_type',
          message: 'Wrong fields type',
          fields: wrongFieldsType
        })
      }
      else if (missingFields.length > 0) {
        res.status(403).json({
          error: 'missing_fields',
          message: 'Missing required fields',
          fields: missingFields
        })
      }
      else if (notExistsFields.length > 0) {
        res.status(404).json({
          error: 'object_not_exists',
          message: 'One or more objects not exists',
          objects: notExistsFields
        })
      }
      else if (existsFields.length > 0) {
        res.status(403).json({
          error: 'object_already_exists',
          message: 'One or more objects already exists',
          objects: existsFields
        })
      } else {
        // It's OK! Go on
        next()
      }
    }
  } else {
    setTimeout(() => {
      next()
    }, 1000)
  }
}
