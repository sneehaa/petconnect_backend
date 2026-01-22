const mongoose = require("mongoose");
const paymentRepo = require("../repository/payment.repository");
const walletRepo = require("../repository/wallet.repository");
const rabbitmq = require("../utils/rabbitmq");
const redisClient = require("../utils/redisClient");
const { v4: uuidv4 } = require("uuid");

const PAYMENT_EXCHANGE = "payment_events_exchange";

function toObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ID format: ${id}`);
  }
  return new mongoose.Types.ObjectId(id);
}

async function updatePaymentCache(payment) {
  if (!payment) return;
  await redisClient.setEx(
    `payment:${payment._id}`,
    600,
    JSON.stringify(payment),
  );
  await redisClient.setEx(
    `payment:adoption:${payment.adoptionId}`,
    600,
    JSON.stringify(payment),
  );
}

exports.initiatePayment = async (paymentData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Generate unique transaction ID
    const transactionId = `TXN${Date.now()}${uuidv4().slice(0, 8)}`;

    const payment = await paymentRepo.createPayment(
      {
        ...paymentData,
        transactionId,
        status: "pending",
      },
      session,
    );

    await updatePaymentCache(payment);

    // Publish payment initiated event
    await rabbitmq.publish(PAYMENT_EXCHANGE, "payment.initiated", {
      paymentId: payment._id,
      adoptionId: payment.adoptionId,
      userId: payment.userId,
      businessId: payment.businessId,
      amount: payment.amount,
      transactionId,
    });

    await session.commitTransaction();
    return payment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

exports.processPayment = async (paymentId, paymentMethod = "wallet") => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await paymentRepo.updatePayment(
      paymentId,
      { status: "processing", paymentMethod },
      session,
    );

    if (!payment) throw new Error("Payment not found");

    // Check user wallet balance
    const userWallet = await walletRepo.findByUserId(payment.userId, session);
    if (!userWallet) throw new Error("User wallet not found");

    if (userWallet.balance < payment.amount) {
      throw new Error("Insufficient balance");
    }

    // Deduct from user wallet
    userWallet.balance -= payment.amount;
    userWallet.transactions.push({
      transactionId: payment.transactionId,
      type: "debit",
      amount: payment.amount,
      description: `Payment for adoption #${payment.adoptionId}`,
      referenceId: payment._id,
      referenceModel: "Payment",
      status: "success",
    });
    await walletRepo.updateWallet(userWallet, session);

    // Credit to business wallet
    const businessWallet = await walletRepo.findByUserId(
      payment.businessId,
      session,
    );
    if (!businessWallet) {
      // Create business wallet if doesn't exist
      await walletRepo.createWallet(
        {
          userId: payment.businessId,
          balance: payment.amount,
          role: "business",
        },
        session,
      );
    } else {
      businessWallet.balance += payment.amount;
      businessWallet.transactions.push({
        transactionId: payment.transactionId,
        type: "credit",
        amount: payment.amount,
        description: `Payment received for adoption #${payment.adoptionId}`,
        referenceId: payment._id,
        referenceModel: "Payment",
        status: "success",
      });
      await walletRepo.updateWallet(businessWallet, session);
    }

    // Update payment status
    const updatedPayment = await paymentRepo.updatePayment(
      paymentId,
      {
        status: "completed",
        completedAt: new Date(),
      },
      session,
    );

    await updatePaymentCache(updatedPayment);

    // Clear cache for both wallets
    await redisClient.del(`wallet:${payment.userId}`);
    await redisClient.del(`wallet:${payment.businessId}`);

    // Publish payment completed event
    await rabbitmq.publish(PAYMENT_EXCHANGE, "payment.completed", {
      paymentId: updatedPayment._id,
      adoptionId: updatedPayment.adoptionId,
      userId: updatedPayment.userId,
      businessId: updatedPayment.businessId,
      amount: updatedPayment.amount,
      transactionId: updatedPayment.transactionId,
    });

    await session.commitTransaction();
    return updatedPayment;
  } catch (error) {
    await session.abortTransaction();

    // Update payment as failed
    await paymentRepo.updatePayment(paymentId, {
      status: "failed",
      metadata: { error: error.message },
    });

    // Publish payment failed event
    await rabbitmq.publish(PAYMENT_EXCHANGE, "payment.failed", {
      paymentId,
      reason: error.message,
    });

    throw error;
  } finally {
    session.endSession();
  }
};

exports.getUserPayments = async (userId, page = 1, limit = 10) => {
  const cacheKey = `user_payments:${userId}:page:${page}:limit:${limit}`;
  const cached = await redisClient.get(cacheKey);

  if (cached) return JSON.parse(cached);

  const payments = await paymentRepo.findByUserId(userId, page, limit);

  await redisClient.setEx(cacheKey, 300, JSON.stringify(payments));
  return payments;
};

exports.getBusinessEarnings = async (businessId, page = 1, limit = 10) => {
  const cacheKey = `business_earnings:${businessId}:page:${page}:limit:${limit}`;
  const cached = await redisClient.get(cacheKey);

  if (cached) return JSON.parse(cached);

  const payments = await paymentRepo.findByBusinessId(businessId, page, limit);

  await redisClient.setEx(cacheKey, 300, JSON.stringify(payments));
  return payments;
};

exports.getBusinessStats = async (
  businessId,
  startDate = null,
  endDate = null,
) => {
  const cacheKey = `business_stats:${businessId}:${startDate}:${endDate}`;
  const cached = await redisClient.get(cacheKey);

  if (cached) return JSON.parse(cached);

  const stats = await paymentRepo.getPaymentStats(
    businessId,
    startDate,
    endDate,
  );

  await redisClient.setEx(cacheKey, 300, JSON.stringify(stats));
  return stats;
};

exports.getAllTransactions = async (page = 1, limit = 20, filters = {}) => {
  const cacheKey = `all_transactions:page:${page}:limit:${limit}:${JSON.stringify(filters)}`;
  const cached = await redisClient.get(cacheKey);

  if (cached) return JSON.parse(cached);

  const payments = await paymentRepo.findAllPayments(page, limit, filters);

  await redisClient.setEx(cacheKey, 180, JSON.stringify(payments));
  return payments;
};

exports.getPaymentById = async (paymentId) => {
  const cached = await redisClient.get(`payment:${paymentId}`);
  if (cached) return JSON.parse(cached);

  const payment = await paymentRepo.findByAdoptionId(paymentId);
  if (!payment) throw new Error("Payment not found");

  await updatePaymentCache(payment);
  return payment;
};
