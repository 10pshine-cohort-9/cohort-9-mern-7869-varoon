const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();

// POST /api/auth/signup — register a new user
router.post('/signup', authController.signup);

// POST /api/auth/login — authenticate and return JWT
router.post('/login', authController.login);

// POST /api/auth/logout — log the event (requires valid token)
router.post('/logout', authenticate, authController.logout);

module.exports = router;
