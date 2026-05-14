const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, studentController.addStudent);
router.get('/', authMiddleware, studentController.getStudents);
router.get('/dashboard', authMiddleware, studentController.getDashboardStats);
router.put('/:id', authMiddleware, studentController.updateStudent);
router.delete('/:id', authMiddleware, studentController.deleteStudent);
router.post('/:id/payment', authMiddleware, studentController.addPayment);

module.exports = router;
