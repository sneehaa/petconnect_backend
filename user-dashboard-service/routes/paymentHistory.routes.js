const router = require('express').Router();
const { getPaymentHistory } = require('../controllers/paymentHistory.controller');

router.get('/:userId', getPaymentHistory);

module.exports = router;
