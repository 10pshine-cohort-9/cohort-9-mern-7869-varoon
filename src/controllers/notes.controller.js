const asyncHandler = require('../utils/async-handler');
const { createChildLogger } = require('../utils/logger');

const log = createChildLogger('notes-controller');

// TODO: Implement notes controller
// All handlers are wrapped with asyncHandler — any thrown or async
// error is automatically forwarded to the global error handler.

// Handlers to implement:
// const createNote  = asyncHandler(async (req, res) => { ... });
// const getNotes    = asyncHandler(async (req, res) => { ... });
// const getNoteById = asyncHandler(async (req, res) => { ... });
// const updateNote  = asyncHandler(async (req, res) => { ... });
// const deleteNote  = asyncHandler(async (req, res) => { ... });

/**
 * Logging guidance for each handler (use req.log for request context):
 *
 *   createNote:   req.log.info({ userId }, 'Note created')
 *   getNotes:     req.log.debug({ userId, count }, 'Notes retrieved')
 *   getNoteById:  req.log.debug({ userId, noteId }, 'Note retrieved')
 *                 req.log.warn({ userId, noteId }, 'Note not found')
 *   updateNote:   req.log.info({ userId, noteId }, 'Note updated')
 *   deleteNote:   req.log.info({ userId, noteId }, 'Note deleted')
 *   errors:       Handled automatically by asyncHandler → global error middleware
 */
module.exports = {
  // TODO: createNote
  // TODO: getNotes
  // TODO: getNoteById
  // TODO: updateNote
  // TODO: deleteNote
};
