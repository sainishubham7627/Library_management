const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// router.post('/register', authController.register); // Removed for security. Admins created via seed script.
router.post('/login', authController.login);

module.exports = router;
