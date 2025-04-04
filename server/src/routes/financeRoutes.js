const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

router.post('/', financeController.addTransaction);
router.get('/', financeController.getTransactions);
router.get('/balance', financeController.getBalanceSheet);

module.exports = router;
