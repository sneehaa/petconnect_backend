const mongoose = require("mongoose");
const paymentRepo = require("../repository/payment.repository");
const walletRepo = require("../repository/wallet.repository");
const rabbitmq = require("../utils/rabbitmq");
const { v4: uuidv4 } = require("uuid");

class PaymentService {
  async createPaymentDirect(paymentData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const transactionId = `TXN${Date.now()}${uuidv4().slice(0, 8)}`;
      const payment = await paymentRepo.createPayment(
        {
          ...paymentData,
          transactionId,
          status: "pending",
          userName: paymentData.userName,
          userPhone: paymentData.userPhone,
          petName: paymentData.petName,
        },
        session,
      );
      await session.commitTransaction();
      return payment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async processPaymentDirect(paymentId, paymentMethod) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const payment = await paymentRepo.findById(paymentId);
      if (!payment) throw new Error("Payment record not found");
      if (payment.status !== "pending")
        throw new Error(`Payment is ${payment.status}`);

      const userWallet = await walletRepo.findByUserId(payment.userId, session);
      if (!userWallet || userWallet.balance < payment.amount) {
        throw new Error(
          `Insufficient funds. Required: ${payment.amount}, Available: ${userWallet?.balance || 0}`,
        );
      }

      userWallet.balance -= payment.amount;
      userWallet.transactions.push({
        transactionId: payment.transactionId,
        type: "debit",
        amount: payment.amount,
        description: `Adoption Payment for Pet #${payment.petId}`,
        status: "success",
      });
      await walletRepo.updateWallet(userWallet, session);

      const bizWallet = await walletRepo.findByUserId(
        payment.businessId,
        session,
      );
      if (!bizWallet) {
        await walletRepo.createWallet(
          {
            userId: payment.businessId,
            balance: payment.amount,
            role: "business",
          },
          session,
        );
      } else {
        bizWallet.balance += payment.amount;
        bizWallet.transactions.push({
          transactionId: payment.transactionId,
          type: "credit",
          amount: payment.amount,
          description: `Sale from adoption #${payment.adoptionId}`,
          status: "success",
          userName: payment.userName,
          petName: payment.petName,
        });
        await walletRepo.updateWallet(bizWallet, session);
      }

      const updatedPayment = await paymentRepo.updatePayment(
        paymentId,
        { status: "completed", paymentMethod, completedAt: new Date() },
        session,
      );

      await rabbitmq.publish(
        "payment_events_exchange",
        "payment.completed",
        updatedPayment,
      );

      await session.commitTransaction();
      return updatedPayment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getPaymentById(paymentId) {
    const payment = await paymentRepo.findById(paymentId);
    if (!payment) throw new Error("Payment not found");
    return payment;
  }

  async getPaymentByAdoptionId(adoptionId) {
    const payment = await paymentRepo.findByAdoptionId(adoptionId);
    return payment;
  }

  async getPaymentsByUserDirect(userId, page, limit) {
    return paymentRepo.findByUserId(userId, page, limit);
  }

  async getPaymentsByBusiness(businessId, page, limit) {
    return paymentRepo.findByBusinessId(businessId, page, limit);
  }

  async getBusinessStatsDirect(businessId) {
    const stats = await paymentRepo.getPaymentStats(businessId);

    if (stats.length > 0) {
      return stats[0];
    }

    return {
      businessId: businessId,
      totalAmount: 0,
      totalTransactions: 0,
      averageAmount: 0,
    };
  }
  async getAllTransactionsDirect(page, limit, filters) {
    return paymentRepo.findAllPayments(page, limit, filters);
  }
}

module.exports = new PaymentService();
