const Joi = require('joi');
const ApiError = require('../utils/api-error');

const TITLE_MAX_LENGTH = 255;
const CONTENT_MAX_LENGTH = 50000;

/**
 * Builds a note schema with shared field definitions.
 * Both create and update use the same shape.
 */
function buildNoteSchema() {
  return Joi.object({
    title: Joi.string().trim().min(1).max(TITLE_MAX_LENGTH).required()
      .messages({
        'string.empty': 'Title is required',
        'string.max': `Title must be at most ${TITLE_MAX_LENGTH} characters`,
        'any.required': 'Title is required',
      }),
    content: Joi.string().trim().min(1).max(CONTENT_MAX_LENGTH).required()
      .messages({
        'string.empty': 'Content is required',
        'string.max': `Content must be at most ${CONTENT_MAX_LENGTH} characters`,
        'any.required': 'Content is required',
      }),
  });
}

const createNoteSchema = buildNoteSchema();
const updateNoteSchema = buildNoteSchema();

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
