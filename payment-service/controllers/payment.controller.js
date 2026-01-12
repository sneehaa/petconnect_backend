const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const Payment = require("../models/payment.model");
const Transaction = require("../models/transaction.model");
const Receipt = require("../models/receipt.model");
const { initiateKhalti, verifyKhalti } = require("../services/khalti.service");
const { generateReceiptNo, successResponse, errorResponse } = require("../utils/generateReceiptNo");

// initiate payment
const initiatePayment = async (req, res) => {
  try {
    if (!req.user?.id) return errorResponse(res, "unauthorized", 401);

    const { adoptionId, amount } = req.body;
    if (!adoptionId || !amount) return errorResponse(res, "missing fields", 400);

    // check adoption exists from adoption-service
    const adoptionRes = await axios.get(
      `${process.env.ADOPTION_SERVICE_URL}/${adoptionId}`,
      { headers: { Authorization: req.headers.authorization } }
    );

    if (!adoptionRes.data) return errorResponse(res, "adoption not found", 404);

    const referenceId = uuidv4();
    const payment = await Payment.create({
      userId: req.user.id,
      adoptionId,
      referenceId,
      amount,
      serviceType: "KHALTI",
      status: "PENDING",
    });

    const khaltiResponse = await initiateKhalti({
      amount: amount * 100,
      purchase_order_id: payment._id,
      purchase_order_name: "Pet Adoption Payment",
      return_url: process.env.PAYMENT_SUCCESS_URL,
    });

    payment.khalti = { pidx: khaltiResponse.pidx };
    await payment.save();

    successResponse(res, { pidx: khaltiResponse.pidx, paymentId: payment._id }, "payment initiated");
  } catch (err) {
    console.error("initiate payment error:", err.message);
    errorResponse(res, "payment initiation failed");
  }
};

// verify payment
const verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.body;
    if (!pidx) return errorResponse(res, "pidx required", 400);

    const verification = await verifyKhalti(pidx);
    const payment = await Payment.findOne({ "khalti.pidx": pidx });
    if (!payment) return errorResponse(res, "payment not found", 404);

    if (verification.status !== "Completed") return errorResponse(res, "payment not completed", 400);

    payment.status = "SUCCESS";
    payment.paidAt = new Date();
    await payment.save();

    await Transaction.create({
      userId: payment.userId,
      paymentId: payment._id,
      amount: payment.amount,
      status: "SUCCESS",
      title: "adoption payment",
    });

    await Receipt.create({
      paymentId: payment._id,
      issuedTo: payment.userId,
      receiptNumber: generateReceiptNo(),
    });

    // notify adoption-service
    await axios.patch(
      `${process.env.ADOPTION_SERVICE_URL}/${payment.adoptionId}/mark-paid`,
      {},
      { headers: { Authorization: req.headers.authorization } }
    );

    successResponse(res, null, "payment verified");
  } catch (err) {
    console.error("verify payment error:", err.message);
    errorResponse(res, "verification failed");
  }
};

// get user transactions
const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    successResponse(res, transactions);
  } catch (err) {
    errorResponse(res);
  }
};

// get receipt by payment id
const getReceiptByPaymentId = async (req, res) => {
  try {
    const receipt = await Receipt.findOne({ paymentId: req.params.paymentId, issuedTo: req.user.id });
    if (!receipt) return errorResponse(res, "receipt not found", 404);
    successResponse(res, receipt);
  } catch (err) {
    errorResponse(res);
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  getMyTransactions,
  getReceiptByPaymentId,
};
