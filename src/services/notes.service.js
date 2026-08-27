const noteModel = require('../models/note.model');
const ApiError = require('../utils/api-error');
const { createChildLogger } = require('../utils/logger');

const log = createChildLogger('notes-service');

async function createNote(userId, title, content) {
  const note = await noteModel.create(userId, title, content);
  log.info({ userId, noteId: note.id }, 'Note created');
  return note;
}

async function getNotes(userId) {
  const notes = await noteModel.findAllByUser(userId);
  log.debug({ userId, count: notes.length }, 'Notes retrieved');
  return notes;
}

async function getNoteById(noteId, userId) {
  const note = await noteModel.findById(noteId);

  if (!note) {
    log.warn({ userId, noteId }, 'Note not found');
    throw ApiError.notFound('Note not found');
  }

  if (note.user_id !== userId) {
    log.warn({ userId, noteId, ownerId: note.user_id }, 'Not authorized to access this note');
    throw ApiError.forbidden('Not authorized to access this note');
  }

  log.debug({ userId, noteId }, 'Note retrieved');
  return note;
}

async function updateNote(noteId, userId, title, content) {
  const existing = await noteModel.findById(noteId);

  if (!existing) {
    log.warn({ userId, noteId }, 'Update failed — note not found');
    throw ApiError.notFound('Note not found');
  }

  if (existing.user_id !== userId) {
    log.warn({ userId, noteId, ownerId: existing.user_id }, 'Not authorized to modify this note');
    throw ApiError.forbidden('Not authorized to modify this note');
  }

  const updated = await noteModel.update(noteId, title, content);
  log.info({ userId, noteId }, 'Note updated');
  return updated;
}

async function deleteNote(noteId, userId) {
  const existing = await noteModel.findById(noteId);

  if (!existing) {
    log.warn({ userId, noteId }, 'Delete failed — note not found');
    throw ApiError.notFound('Note not found');
  }

  if (existing.user_id !== userId) {
    log.warn({ userId, noteId, ownerId: existing.user_id }, 'Not authorized to delete this note');
    throw ApiError.forbidden('Not authorized to delete this note');
  }

  await noteModel.remove(noteId);
  log.info({ userId, noteId }, 'Note deleted');
}

async function searchNotes(userId, query, fromDate, toDate) {
  const notes = await noteModel.search(userId, query, fromDate, toDate);
  log.debug({ userId, query, fromDate, toDate, count: notes.length }, 'Notes search completed');
  return notes;
}

module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote, searchNotes };
