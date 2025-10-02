const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.profile);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
