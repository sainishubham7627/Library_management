const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, feeController.getFeeStructure);
router.put('/', authMiddleware, feeController.updateFeeStructure);

module.exports = router;
