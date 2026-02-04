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

exports.findByAdoptionId = async (adoptionId, session = null) => {
  const query = Payment.findOne({ adoptionId });
  if (session) query.session(session);
  return await query.exec();
};

exports.getPaymentStats = async (
  businessId = null,
  startDate = null,
  endDate = null,
) => {
  console.log(
    `DEBUG REPO: Getting payment stats for businessId: ${businessId}`,
  );
  console.log(`DEBUG REPO: BusinessId type: ${typeof businessId}`);

  const matchStage = {};
  if (businessId) {
    console.log(
      `DEBUG REPO: Filtering by businessId (as string): ${businessId}`,
    );
    // Keep as string since businessId field in DB is stored as string
    matchStage.businessId = businessId.toString();
  }

  if (startDate && endDate) {
    console.log(
      `DEBUG REPO: Date range - start: ${startDate}, end: ${endDate}`,
    );
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  matchStage.status = "completed";
  console.log(`DEBUG REPO: Match stage:`, JSON.stringify(matchStage, null, 2));

  // First, let's check what data we have
  console.log(`DEBUG REPO: Checking raw data first...`);
  const sampleData = await Payment.find(matchStage).limit(2);
  console.log(`DEBUG REPO: Sample payments found:`, sampleData.length);
  if (sampleData.length > 0) {
    console.log(
      `DEBUG REPO: Sample businessId field:`,
      sampleData[0].businessId,
    );
    console.log(
      `DEBUG REPO: Sample businessId type:`,
      typeof sampleData[0].businessId,
    );
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: "$businessId",
        totalAmount: { $sum: "$amount" },
        totalTransactions: { $sum: 1 },
        averageAmount: { $avg: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        businessId: "$_id",
        totalAmount: 1,
        totalTransactions: 1,
        averageAmount: { $round: ["$averageAmount", 2] },
      },
    },
  ];

  console.log(
    `DEBUG REPO: Aggregation pipeline:`,
    JSON.stringify(pipeline, null, 2),
  );

  try {
    const result = await Payment.aggregate(pipeline);
    console.log(
      `DEBUG REPO: Aggregation result:`,
      JSON.stringify(result, null, 2),
    );
    return result;
  } catch (error) {
    console.error(`DEBUG REPO: Aggregation error:`, error);
    throw error;
  }
};
