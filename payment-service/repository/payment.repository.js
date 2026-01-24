const Payment = require("../models/payment.model");
const mongoose = require("mongoose");

exports.createPayment = async (paymentData, session = null) => {
  const payment = new Payment(paymentData);
  if (session) {
    await payment.save({ session });
    return payment;
  }
  return await payment.save();
};

exports.findById = async (id) => {
  return await Payment.findById(id);
};

exports.findByAdoptionId = async (adoptionId, session = null) => {
  const query = Payment.findOne({ adoptionId: adoptionId.toString() });
  if (session) query.session(session);
  return await query.exec();
};

exports.findByUserId = async (userId, page = 1, limit = 10, session = null) => {
  const skip = (page - 1) * limit;
  const query = Payment.find({ userId: userId.toString() })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  if (session) query.session(session);
  return await query.exec();
};

exports.findByBusinessId = async (
  businessId,
  page = 1,
  limit = 10,
  session = null,
) => {
  const skip = (page - 1) * limit;
  const query = Payment.find({ businessId: businessId.toString() })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  if (session) query.session(session);
  return await query.exec();
};

exports.findAllPayments = async (
  page = 1,
  limit = 20,
  filters = {},
  session = null,
) => {
  const skip = (page - 1) * limit;
  const query = Payment.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  if (session) query.session(session);
  return await query.exec();
};

exports.updatePayment = async (paymentId, updateData, session = null) => {
  const query = Payment.findByIdAndUpdate(paymentId, updateData, { new: true });
  if (session) query.session(session);
  return await query.exec();
};

exports.getPaymentStats = async (
  businessId = null,
  startDate = null,
  endDate = null,
) => {
  const matchStage = {};
  if (businessId) matchStage.businessId = businessId.toString();
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }
  matchStage.status = "completed";
  return await Payment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        totalTransactions: { $sum: 1 },
        averageAmount: { $avg: "$amount" },
      },
    },
  ]);
};
