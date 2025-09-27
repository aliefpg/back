const Joi = require('joi');

module.exports = {
  schemaMiddleware: (schema) => (req, res, next) => {
    const result = schema.validate(req.body);
  },
};
