const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.post('/logout', authenticate, authController.logout);

module.exports = router;
