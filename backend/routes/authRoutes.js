const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/demo', authController.startDemo);
router.delete('/account', authMiddleware, authController.deleteAccount);
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;
