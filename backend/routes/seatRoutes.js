const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/init', authMiddleware, seatController.initializeSeats);
router.get('/', authMiddleware, seatController.getSeats);
router.get('/:seatNumber', authMiddleware, seatController.getSeatDetails);
router.put('/config', authMiddleware, seatController.updateSeatConfig);

module.exports = router;
