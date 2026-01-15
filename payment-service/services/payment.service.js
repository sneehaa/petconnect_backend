const axios = require("axios");
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
    if (!adoptionId || !amount) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const adoptionRes = await axios.get(
      `${process.env.ADOPTION_SERVICE_URL}/${adoptionId}`,
      { headers: { Authorization: req.headers.authorization } }
    );

    if (!adoptionRes.data.success || !adoptionRes.data.adoption) {
      return res.status(404).json({ success: false, message: "Adoption not found" });
    }

    const adoption = adoptionRes.data.adoption;

    if (adoption.status !== "payment_pending") {
      return res.status(400).json({ 
        success: false, 
        message: `Adoption not ready for payment. Status: ${adoption.status}` 
      });
    }

    const referenceId = uuidv4();
    const payment = await Payment.create({
      userId: req.user.id,
      adoptionId,
      businessId: adoption.businessId,
      referenceId,
      amount,
      serviceType: "KHALTI",
      status: "PENDING",
    });

    const khaltiResponse = await initiateKhalti({
      amount: amount * 100,
      purchase_order_id: payment._id.toString(),
      purchase_order_name: `Pet Adoption - ${adoption.petId}`,
      return_url: process.env.PAYMENT_SUCCESS_URL || "http://localhost:3000/payment-success",
    });

    payment.khalti = { pidx: khaltiResponse.pidx };
    await payment.save();

    return res.status(200).json({ 
      success: true, 
      message: "Payment initiated successfully",
      data: { 
        pidx: khaltiResponse.pidx, 
        paymentId: payment._id,
        payment_url: khaltiResponse.payment_url || khaltiResponse.pidx
      }
    });
    
  } catch (err) {
    console.error("Initiate payment error:", err.message);
    return res.status(500).json({ 
      success: false, 
      message: `Payment initiation failed: ${err.message}` 
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.body;
    if (!pidx) {
      return res.status(400).json({ success: false, message: "pidx required" });
    }

    const verification = await verifyKhalti(pidx);
    const payment = await Payment.findOne({ "khalti.pidx": pidx });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (verification.status !== "Completed") {
      return res.status(400).json({ 
        success: false, 
        message: `Payment not completed. Status: ${verification.status}` 
      });
    }

    payment.status = "SUCCESS";
    payment.paidAt = new Date();
    await payment.save();

    await Transaction.create({
      userId: payment.userId,
      businessId: payment.businessId,
      paymentId: payment._id,
      amount: payment.amount,
      status: "SUCCESS",
      title: "Adoption Payment",
      type: "PAYMENT"
    });

    const receiptNumber = `RCPT-${Date.now()}-${payment._id.toString().slice(-6)}`;
    await Receipt.create({
      paymentId: payment._id,
      userId: payment.userId,
      receiptNumber,
      amount: payment.amount,
      issuedAt: new Date()
    });

    try {
      await axios.patch(
        `${process.env.ADOPTION_SERVICE_URL}/${payment.adoptionId}/mark-paid`,
        { paymentId: payment._id },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (adoptionErr) {
      console.error("Failed to update adoption service:", adoptionErr.message);
    }

    return res.status(200).json({ 
      success: true, 
      message: "Payment verified successfully",
      data: { 
        paymentId: payment._id,
        receiptNumber,
        amount: payment.amount
      }
    });
  } catch (err) {
    console.error("Verify payment error:", err.message);
    return res.status(500).json({ 
      success: false, 
      message: `Verification failed: ${err.message}` 
    });
  }
};

const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to get transactions" });
  }
};

const getReceiptByPaymentId = async (req, res) => {
  try {
    const receipt = await Receipt.findOne({ 
      paymentId: req.params.paymentId, 
      userId: req.user.id 
    });
    
    if (!receipt) {
      return res.status(404).json({ success: false, message: "Receipt not found" });
    }
    
    return res.status(200).json({ success: true, data: receipt });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to get receipt" });
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  getMyTransactions,
  getReceiptByPaymentId,
};