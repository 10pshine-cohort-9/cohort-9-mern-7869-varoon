const Joi = require('joi');
const ApiError = require('../utils/api-error');

const createNoteSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required()
    .messages({
      'string.empty': 'Title is required',
      'string.max': 'Title must be at most 255 characters',
      'any.required': 'Title is required',
    }),
  content: Joi.string().trim().min(1).max(10000).required()
    .messages({
      'string.empty': 'Content is required',
      'string.max': 'Content must be at most 10000 characters',
      'any.required': 'Content is required',
    }),
});

const updateNoteSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required()
    .messages({
      'string.empty': 'Title is required',
      'string.max': 'Title must be at most 255 characters',
      'any.required': 'Title is required',
    }),
  content: Joi.string().trim().min(1).max(10000).required()
    .messages({
      'string.empty': 'Content is required',
      'string.max': 'Content must be at most 10000 characters',
      'any.required': 'Content is required',
    }),
});

function validate(schema) {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      return next(ApiError.badRequest(message));
    }

    req.body = value;
    next();
  };
}

module.exports = { createNoteSchema, updateNoteSchema, validate };
