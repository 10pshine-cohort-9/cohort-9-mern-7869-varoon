const { createChildLogger } = require('../utils/logger');

const log = createChildLogger('notes-controller');

// TODO: Implement notes controller
// Handlers to implement:
// - createNote(req, res, next)
// - getNotes(req, res, next)
// - getNoteById(req, res, next)
// - updateNote(req, res, next)
// - deleteNote(req, res, next)

/**
 * Logging guidance for each handler (use req.log for request context):
 *
 *   createNote:   req.log.info({ userId }, 'Note created')
 *   getNotes:     req.log.debug({ userId, count }, 'Notes retrieved')
 *   getNoteById:  req.log.debug({ userId, noteId }, 'Note retrieved')
 *                 req.log.warn({ userId, noteId }, 'Note not found')
 *   updateNote:   req.log.info({ userId, noteId }, 'Note updated')
 *   deleteNote:   req.log.info({ userId, noteId }, 'Note deleted')
 *   errors:       req.log.error({ err, userId }, 'Notes operation failed')
 */
module.exports = {
  // TODO: createNote
  // TODO: getNotes
  // TODO: getNoteById
  // TODO: updateNote
  // TODO: deleteNote
};
