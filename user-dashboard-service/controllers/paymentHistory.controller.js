const Payment = require('../models/PaymentHistory');

exports.getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.params.userId });
        res.status(200).json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
