const notesService = require('../services/notes.service');
const asyncHandler = require('../utils/async-handler');
const { createChildLogger } = require('../utils/logger');

const log = createChildLogger('notes-controller');

const createNote = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { title, content } = req.body;

  req.log.info({ userId }, 'Create note attempt');

  const note = await notesService.createNote(userId, title, content);

  res.status(201).json({
    success: true,
    message: 'Note created successfully',
    data: note,
  });
});

const getNotes = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const notes = await notesService.getNotes(userId);

  res.status(200).json({
    success: true,
    message: 'Notes retrieved successfully',
    data: notes,
  });
});

const getNoteById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const noteId = parseInt(req.params.id, 10);

  const note = await notesService.getNoteById(noteId, userId);

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

  res.status(200).json({
    success: true,
    message: 'Note deleted successfully',
  });
});

const searchNotes = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { q, from, to } = req.query;

  const notes = await notesService.searchNotes(userId, q, from, to);

  res.status(200).json({
    success: true,
    message: 'Search completed',
    data: notes,
  });
});

module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote, searchNotes };
