const notesService = require('../services/notes.service');
const asyncHandler = require('../utils/async-handler');

function emitToUser(req, event, payload) {
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${req.user.id}`).emit(event, payload);
  }
}

const createNote = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { title, content } = req.body;

  req.log.info({ userId }, 'Create note attempt');

  const note = await notesService.createNote(userId, title, content);

  req.log.info({ userId, noteId: note.id }, 'Note created successfully');

  emitToUser(req, 'note:created', note);

  res.status(201).json({
    success: true,
    message: 'Note created successfully',
    data: note,
  });
});

const getNotes = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  req.log.info({ userId }, 'Fetch all notes attempt');

  const notes = await notesService.getNotes(userId);

  req.log.info({ userId, count: notes.length }, 'Notes retrieved');

  res.status(200).json({
    success: true,
    message: 'Notes retrieved successfully',
    data: notes,
  });
});

const getNoteById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const noteId = parseInt(req.params.id, 10);

  req.log.info({ userId, noteId }, 'Fetch note by id attempt');

  const note = await notesService.getNoteById(noteId, userId);

  req.log.info({ userId, noteId }, 'Note retrieved');

  res.status(200).json({
    success: true,
    message: 'Note retrieved successfully',
    data: note,
  });
});

const updateNote = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const noteId = parseInt(req.params.id, 10);
  const { title, content } = req.body;

  req.log.info({ userId, noteId }, 'Update note attempt');

  const note = await notesService.updateNote(noteId, userId, title, content);

  req.log.info({ userId, noteId }, 'Note updated successfully');

  emitToUser(req, 'note:updated', note);

  res.status(200).json({
    success: true,
    message: 'Note updated successfully',
    data: note,
  });
});

const deleteNote = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const noteId = parseInt(req.params.id, 10);

  req.log.info({ userId, noteId }, 'Delete note attempt');

  await notesService.deleteNote(noteId, userId);

  req.log.info({ userId, noteId }, 'Note deleted successfully');

  emitToUser(req, 'note:deleted', { id: noteId });

  res.status(200).json({
    success: true,
    message: 'Note deleted successfully',
  });
});

const searchNotes = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { q, from, to } = req.query;

  req.log.info({ userId, query: q, from, to }, 'Search notes attempt');

  const notes = await notesService.searchNotes(userId, q, from, to);

  req.log.info({ userId, query: q, count: notes.length }, 'Search completed');

  res.status(200).json({
    success: true,
    message: 'Search completed',
    data: notes,
  });
});

module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote, searchNotes };
