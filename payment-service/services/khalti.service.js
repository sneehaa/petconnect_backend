const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const Payment = require("../models/payment.model");
const Transaction = require("../models/transaction.model");
const { initiateKhalti, verifyKhalti } = require("./khalti.service");

class PaymentService {
  async initiatePayment(userId, adoptionId, amount) {
    const adoptionRes = await axios.get(
      `${process.env.ADOPTION_SERVICE_URL}/${adoptionId}`
    );
    
    const adoption = adoptionRes.data;
    if (adoption.status !== "payment_pending") {
      throw new Error("Adoption not ready for payment");
    }

    const referenceId = uuidv4();
    const payment = await Payment.create({
      userId,
      adoptionId,
      businessId: adoption.businessId,
      referenceId,
      amount,
      serviceType: "KHALTI",
      status: "PENDING"
    });

    const khaltiResponse = await initiateKhalti({
      amount: amount * 100,
      purchase_order_id: payment._id,
      purchase_order_name: `Pet Adoption - ${adoption.petId}`,
      return_url: process.env.PAYMENT_SUCCESS_URL
    });

    payment.khalti = { pidx: khaltiResponse.pidx };
    await payment.save();

    return { pidx: khaltiResponse.pidx, paymentId: payment._id };
  }

  async verifyPayment(pidx) {
    const verification = await verifyKhalti(pidx);
    const payment = await Payment.findOne({ "khalti.pidx": pidx });
    
    if (!payment) throw new Error("Payment not found");
    if (verification.status !== "Completed") {
      throw new Error("Payment not completed");
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
      title: "Adoption Payment"
    });

    await axios.patch(
      `${process.env.ADOPTION_SERVICE_URL}/${payment.adoptionId}/mark-paid`,
      { paymentId: payment._id }
    );

    await this.processBusinessPayout(payment.businessId, payment.amount);

    return payment;
  }

  async processBusinessPayout(businessId, amount) {
    const platformFee = amount * 0.10;
    const businessAmount = amount - platformFee;

    await Transaction.create({
      businessId,
      amount: businessAmount,
      status: "PROCESSING",
      title: "Business Payout",
      type: "PAYOUT"
    });

    return { businessAmount, platformFee };
  }

  async getBusinessTransactions(businessId) {
    return Transaction.find({ 
      $or: [{ businessId }, { "metadata.businessId": businessId }] 
    }).sort({ createdAt: -1 });
  }

  async getUserTransactions(userId) {
    return Transaction.find({ userId }).sort({ createdAt: -1 });
  }
}

module.exports = new PaymentService();