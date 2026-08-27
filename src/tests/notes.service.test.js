const { expect } = require('chai');
const sinon = require('sinon');

const noteModel = require('../models/note.model');
const notesService = require('../services/notes.service');

describe('Notes Service', function () {
  describe('createNote()', function () {
    it('should create a note and return it', async function () {
      const fakeNote = { id: 1, user_id: 1, title: 'Test', content: 'Body', created_at: new Date(), updated_at: new Date() };
      sinon.stub(noteModel, 'create').resolves(fakeNote);

      const result = await notesService.createNote(1, 'Test', 'Body');

      expect(result).to.deep.equal(fakeNote);
      expect(noteModel.create.calledOnceWith(1, 'Test', 'Body')).to.be.true;
    });
  });

  describe('getNotes()', function () {
    it('should return all notes for a user', async function () {
      const fakeNotes = [
        { id: 1, user_id: 1, title: 'Note 1', content: 'Content 1' },
        { id: 2, user_id: 1, title: 'Note 2', content: 'Content 2' },
      ];
      sinon.stub(noteModel, 'findAllByUser').resolves(fakeNotes);

      const result = await notesService.getNotes(1);

      expect(result).to.have.lengthOf(2);
      expect(noteModel.findAllByUser.calledOnceWith(1)).to.be.true;
    });

    it('should return empty array when user has no notes', async function () {
      sinon.stub(noteModel, 'findAllByUser').resolves([]);

      const result = await notesService.getNotes(1);

      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('getNoteById()', function () {
    it('should return note if it belongs to the user', async function () {
      const fakeNote = { id: 1, user_id: 1, title: 'Test', content: 'Body' };
      sinon.stub(noteModel, 'findById').resolves(fakeNote);

      const result = await notesService.getNoteById(1, 1);

      expect(result).to.deep.equal(fakeNote);
    });

    it('should throw 404 if note does not exist', async function () {
      sinon.stub(noteModel, 'findById').resolves(null);

      try {
        await notesService.getNoteById(999, 1);
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(404);
        expect(err.message).to.equal('Note not found');
      }
    });

    it('should throw 403 if note belongs to another user', async function () {
      const fakeNote = { id: 1, user_id: 2, title: 'Test', content: 'Body' };
      sinon.stub(noteModel, 'findById').resolves(fakeNote);

      try {
        await notesService.getNoteById(1, 1);
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(403);
        expect(err.message).to.equal('Not authorized to access this note');
      }
    });
  });

  describe('updateNote()', function () {
    it('should update and return the note', async function () {
      const existing = { id: 1, user_id: 1, title: 'Old', content: 'Old body' };
      const updated = { id: 1, user_id: 1, title: 'New', content: 'New body' };
      sinon.stub(noteModel, 'findById').resolves(existing);
      sinon.stub(noteModel, 'update').resolves(updated);

      const result = await notesService.updateNote(1, 1, 'New', 'New body');

      expect(result.title).to.equal('New');
      expect(result.content).to.equal('New body');
    });

    it('should throw 404 if note does not exist', async function () {
      sinon.stub(noteModel, 'findById').resolves(null);

      try {
        await notesService.updateNote(999, 1, 'Title', 'Content');
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(404);
        expect(err.message).to.equal('Note not found');
      }
    });

    it('should throw 403 if note belongs to another user', async function () {
      sinon.stub(noteModel, 'findById').resolves({ id: 1, user_id: 2 });

      try {
        await notesService.updateNote(1, 1, 'Title', 'Content');
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(403);
        expect(err.message).to.equal('Not authorized to modify this note');
      }
    });
  });

  describe('deleteNote()', function () {
    it('should delete the note successfully', async function () {
      sinon.stub(noteModel, 'findById').resolves({ id: 1, user_id: 1 });
      sinon.stub(noteModel, 'remove').resolves(true);

      await notesService.deleteNote(1, 1);

      expect(noteModel.remove.calledOnceWith(1)).to.be.true;
    });

    it('should throw 404 if note does not exist', async function () {
      sinon.stub(noteModel, 'findById').resolves(null);

      try {
        await notesService.deleteNote(999, 1);
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(404);
        expect(err.message).to.equal('Note not found');
      }
    });

    it('should throw 403 if note belongs to another user', async function () {
      sinon.stub(noteModel, 'findById').resolves({ id: 1, user_id: 2 });

      try {
        await notesService.deleteNote(1, 1);
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err.statusCode).to.equal(403);
        expect(err.message).to.equal('Not authorized to delete this note');
      }
    });
  });

  describe('searchNotes()', function () {
    it('should return matching notes for keyword search', async function () {
      const fakeNotes = [{ id: 1, user_id: 1, title: 'Meeting', content: 'Notes from meeting' }];
      sinon.stub(noteModel, 'search').resolves(fakeNotes);

      const result = await notesService.searchNotes(1, 'meeting', null, null);

      expect(result).to.have.lengthOf(1);
      expect(noteModel.search.calledOnceWith(1, 'meeting', null, null)).to.be.true;
    });

    it('should pass date range params to the model', async function () {
      sinon.stub(noteModel, 'search').resolves([]);

      await notesService.searchNotes(1, 'test', '2026-01-01', '2026-12-31');

      expect(noteModel.search.calledOnceWith(1, 'test', '2026-01-01', '2026-12-31')).to.be.true;
    });

    it('should return empty array when no matches found', async function () {
      sinon.stub(noteModel, 'search').resolves([]);

      const result = await notesService.searchNotes(1, 'nonexistent', null, null);

      expect(result).to.be.an('array').that.is.empty;
    });
  });
});
