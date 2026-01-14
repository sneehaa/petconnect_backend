// controllers/payment.controller.js
const { v4: uuidv4 } = require("uuid");
const Payment = require("../models/payment.model");
const Transaction = require("../models/transaction.model");
const Receipt = require("../models/receipt.model");
const { initiateKhalti, verifyKhalti } = require("../services/khalti.service");

const initiatePayment = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { adoptionId, amount } = req.body;
    if (!adoptionId || !amount || amount < 10) {
      return res.status(400).json({ 
        success: false, 
        message: "Need adoption ID and amount (min: NPR 10)" 
      });
    }

    // Create payment record
    const payment = await Payment.create({
      userId: req.user.id,
      adoptionId,
      amount,
      status: "PENDING",
      referenceId: uuidv4(),
      metadata: {
        userEmail: req.user.email,
        userName: req.user.name
      }
    });

    // Get mock payment ID
    const khaltiResponse = await initiateKhalti({
      amount: amount * 100,
      purchase_order_id: payment._id.toString(),
      purchase_order_name: `Pet Adoption #${adoptionId.slice(0, 6)}`
    });

    // Save payment ID
    payment.khaltiPidx = khaltiResponse.pidx;
    await payment.save();

    // Simple response for Flutter
    res.json({
      success: true,
      message: "Ready for mock payment",
      data: {
        pidx: khaltiResponse.pidx,
        paymentId: payment._id,
        amount: amount,
        nextStep: "Call verify endpoint to complete"
      }
    });
    
  } catch (err) {
    console.error("Initiate error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.body;
    if (!pidx) {
      return res.status(400).json({ success: false, message: "Need pidx" });
    }

    // Verify mock payment
    const verification = await verifyKhalti(pidx);
    
    // Find and update payment
    const payment = await Payment.findOne({ khaltiPidx: pidx });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    payment.status = "SUCCESS";
    payment.paidAt = new Date();
    await payment.save();

    // Create transaction
    await Transaction.create({
      userId: payment.userId,
      paymentId: payment._id,
      amount: payment.amount,
      status: "SUCCESS",
      title: "Pet Adoption Payment"
    });

    // Generate receipt
    const receiptNumber = `RCPT-${Date.now()}`;
    await Receipt.create({
      paymentId: payment._id,
      userId: payment.userId,
      receiptNumber,
      amount: payment.amount
    });

    // Success response
    res.json({
      success: true,
      message: "✅ Payment Successful (College Project Demo)",
      data: {
        paymentId: payment._id,
        receiptNumber,
        amount: payment.amount,
        paidAt: payment.paidAt
      }
    });
    
  } catch (err) {
    console.error("Verify error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Other functions remain simple...
const getMyTransactions = async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user.id });
  res.json({ success: true, data: transactions });
};

const getReceiptByPaymentId = async (req, res) => {
  const receipt = await Receipt.findOne({ 
    paymentId: req.params.paymentId, 
    userId: req.user.id 
  });
  if (!receipt) {
    return res.status(404).json({ success: false, message: "Receipt not found" });
  }
  res.json({ success: true, data: receipt });
};

module.exports = {
  initiatePayment,
  verifyPayment,
  getMyTransactions,
  getReceiptByPaymentId
};