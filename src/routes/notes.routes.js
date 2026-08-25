const { Router } = require('express');
const notesController = require('../controllers/notes.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate, createNoteSchema, updateNoteSchema } = require('../middlewares/validate.middleware');

const router = Router();

router.use(authenticate);

router.get('/search', notesController.searchNotes);

router.post('/', validate(createNoteSchema), notesController.createNote);
router.get('/', notesController.getNotes);
router.get('/:id', notesController.getNoteById);
router.put('/:id', validate(updateNoteSchema), notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

module.exports = router;
