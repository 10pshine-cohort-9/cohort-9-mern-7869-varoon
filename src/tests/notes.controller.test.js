const { expect } = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const app = require('../app');
const noteModel = require('../models/note.model');
const config = require('../config/env.config');

function makeToken(userId = 1) {
  return jwt.sign(
    { id: userId, name: 'Test User', email: 'test@example.com' },
    config.jwt.secret,
    { expiresIn: '1h' },
  );
}

describe('Notes Controller (HTTP)', function () {
  describe('POST /api/notes', function () {
    it('should create a note and return 201', async function () {
      const token = makeToken(1);
      sinon.stub(noteModel, 'create').resolves({
        id: 1, user_id: 1, title: 'My Note', content: 'Some content',
        created_at: new Date(), updated_at: new Date(),
      });

      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My Note', content: 'Some content' })
        .expect(201);

      expect(res.body.success).to.be.true;
      expect(res.body.data.title).to.equal('My Note');
    });

    it('should return 400 when title is missing', async function () {
      const token = makeToken(1);

      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Some content' })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.include('Title is required');
    });

    it('should return 400 when content is missing', async function () {
      const token = makeToken(1);

      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My Note' })
        .expect(400);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.include('Content is required');
    });

    it('should return 401 without a token', async function () {
      const res = await request(app)
        .post('/api/notes')
        .send({ title: 'My Note', content: 'Content' })
        .expect(401);

      expect(res.body.success).to.be.false;
    });
  });

  describe('GET /api/notes', function () {
    it('should return all notes for the user', async function () {
      const token = makeToken(1);
      sinon.stub(noteModel, 'findAllByUser').resolves([
        { id: 1, user_id: 1, title: 'Note 1', content: 'Body 1' },
        { id: 2, user_id: 1, title: 'Note 2', content: 'Body 2' },
      ]);

      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.lengthOf(2);
    });
  });

  describe('GET /api/notes/:id', function () {
    it('should return a single note', async function () {
      const token = makeToken(1);
      sinon.stub(noteModel, 'findById').resolves({
        id: 1, user_id: 1, title: 'Note 1', content: 'Body 1',
      });

      const res = await request(app)
        .get('/api/notes/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.id).to.equal(1);
    });

    it('should return 404 if note does not exist', async function () {
      const token = makeToken(1);
      sinon.stub(noteModel, 'findById').resolves(null);

      const res = await request(app)
        .get('/api/notes/999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.success).to.be.false;
    });

    it('should return 403 if note belongs to another user', async function () {
      const token = makeToken(1);
      sinon.stub(noteModel, 'findById').resolves({
        id: 1, user_id: 2, title: 'Not Mine', content: 'Secret',
      });

      const res = await request(app)
        .get('/api/notes/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(res.body.success).to.be.false;
      expect(res.body.message).to.include('do not have access');
    });
  });

  describe('PUT /api/notes/:id', function () {
    it('should update and return the note', async function () {
      const token = makeToken(1);
      sinon.stub(noteModel, 'findById').resolves({
        id: 1, user_id: 1, title: 'Old Title', content: 'Old Content',
      });
      sinon.stub(noteModel, 'update').resolves({
        id: 1, user_id: 1, title: 'Updated', content: 'Updated Content',
      });

      const res = await request(app)
        .put('/api/notes/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated', content: 'Updated Content' })
        .expect(200);

      expect(res.body.data.title).to.equal('Updated');
    });

    it('should return 400 for invalid input', async function () {
      const token = makeToken(1);

      const res = await request(app)
        .put('/api/notes/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '', content: '' })
        .expect(400);

      expect(res.body.success).to.be.false;
    });

    it('should return 403 if note belongs to another user', async function () {
      const token = makeToken(1);
      sinon.stub(noteModel, 'findById').resolves({
        id: 1, user_id: 2, title: 'Not Mine', content: 'Secret',
      });

      const res = await request(app)
        .put('/api/notes/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Hacked', content: 'Hacked content' })
        .expect(403);

      expect(res.body.success).to.be.false;
    });
  });

  describe('DELETE /api/notes/:id', function () {
    it('should delete and return 200', async function () {
      const token = makeToken(1);
      sinon.stub(noteModel, 'findById').resolves({ id: 1, user_id: 1 });
      sinon.stub(noteModel, 'remove').resolves(true);

      const res = await request(app)
        .delete('/api/notes/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.message).to.include('deleted');
    });

    it('should return 404 if note does not exist', async function () {
      const token = makeToken(1);
      sinon.stub(noteModel, 'findById').resolves(null);

      const res = await request(app)
        .delete('/api/notes/999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.success).to.be.false;
    });

    it('should return 403 if note belongs to another user', async function () {
      const token = makeToken(1);
      sinon.stub(noteModel, 'findById').resolves({ id: 1, user_id: 2 });

      const res = await request(app)
        .delete('/api/notes/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(res.body.success).to.be.false;
    });
  });

  describe('GET /api/notes/search', function () {
    it('should return matching notes', async function () {
      const token = makeToken(1);
      sinon.stub(noteModel, 'search').resolves([
        { id: 1, user_id: 1, title: 'Meeting Notes', content: 'Discussed roadmap' },
      ]);

      const res = await request(app)
        .get('/api/notes/search?q=meeting')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.lengthOf(1);
    });

    it('should return empty array when no matches', async function () {
      const token = makeToken(1);
      sinon.stub(noteModel, 'search').resolves([]);

      const res = await request(app)
        .get('/api/notes/search?q=nonexistent')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).to.have.lengthOf(0);
    });
  });
});
