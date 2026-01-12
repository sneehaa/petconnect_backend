// payment.controller.js
import Payment from "../models/payment.model.js";
import Transaction from "../models/transaction.model.js";
import Receipt from "../models/receipt.model.js";
import { initiateKhalti, verifyKhalti } from "../services/khalti.service.js";
import generateReceiptNo from "../utils/generateReceiptNo.js";
import { v4 as uuidv4 } from "uuid"; // for referenceId

// --------------------
// Initiate Payment
// --------------------
export const initiatePayment = async (req, res) => {
  try {
    // Make sure req.user exists (authMiddleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Generate unique referenceId automatically
    const referenceId = uuidv4();

    // Create payment in DB
    const payment = await Payment.create({
      userId: req.user.id,
      referenceId,
      serviceType: "khalti",
      ...req.body, // amount, product_identity, product_name, customer info
      status: "PENDING",
    });

    // Call Khalti to initiate payment
    const khaltiResponse = await initiateKhalti({
      amount: payment.amount * 100, // in paisa
      purchase_order_id: payment._id,
      purchase_order_name: payment.product_name || "Pet Payment",
      return_url: "http://localhost:3000/payment-success",
    });

    // Save Khalti transaction ID
    payment.khalti = { pidx: khaltiResponse.pidx };
    await payment.save();

    return res.json({
      success: true,
      message: "Payment initiated",
      payment,
      khalti: khaltiResponse,
    });
  } catch (err) {
    console.error("INITIATE PAYMENT ERROR:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// --------------------
// Verify Payment
// --------------------
export const verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ success: false, message: "Payment ID (pidx) required" });
    }

    // Verify with Khalti
    const verification = await verifyKhalti(pidx);

    const payment = await Payment.findOne({ "khalti.pidx": pidx });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    if (verification.status === "Completed") {
      payment.status = "SUCCESS";
      payment.paidAt = new Date();
      await payment.save();

      // Create transaction record
      await Transaction.create({
        userId: payment.userId,
        paymentId: payment._id,
        title: "Payment Successful",
        amount: payment.amount,
        status: "SUCCESS",
      });

      // Create receipt
      await Receipt.create({
        paymentId: payment._id,
        receiptNumber: generateReceiptNo(),
        issuedTo: payment.userId.toString(),
      });
    }

    return res.json({ success: true, message: "Payment verified", payment });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};
