const paymentService = require("../services/payment.service");
const walletService = require("../services/wallet.service");

exports.initiatePayment = async (req, res) => {
  try {
    const { adoptionId, businessId, petId, amount } = req.body;
    const userId = req.user.userId;

    if (!adoptionId || !businessId || !petId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const payment = await paymentService.initiatePayment({
      userId,
      businessId,
      adoptionId,
      petId,
      amount,
    });

    res.status(201).json({
      success: true,
      message: "Payment initiated",
      payment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { paymentId, paymentMethod } = req.body;

    const payment = await paymentService.processPayment(
      paymentId,
      paymentMethod,
    );

    res.json({
      success: true,
      message: "Payment processed successfully",
      payment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getUserPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;

    const payments = await paymentService.getUserPayments(
      userId,
      parseInt(page),
      parseInt(limit),
    );

    res.json({
      success: true,
      payments,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getBusinessEarnings = async (req, res) => {
  try {
    const businessId = req.user.userId;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    if (req.user.role !== "business") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Business accounts only",
      });
    }

    const payments = await paymentService.getBusinessEarnings(
      businessId,
      parseInt(page),
      parseInt(limit),
    );

    const stats = await paymentService.getBusinessStats(
      businessId,
      startDate,
      endDate,
    );

    res.json({
      success: true,
      payments,
      stats: stats[0] || {
        totalAmount: 0,
        totalTransactions: 0,
        averageAmount: 0,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Super Admin only",
      });
    }

    const { page = 1, limit = 20, status, businessId, userId } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (businessId) filters.businessId = businessId;
    if (userId) filters.userId = userId;

    const payments = await paymentService.getAllTransactions(
      parseInt(page),
      parseInt(limit),
      filters,
    );

    res.json({
      success: true,
      payments,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await paymentService.getPaymentById(paymentId);

    res.json({
      success: true,
      payment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.loadWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;
    const role = req.user.role;

    const wallet = await walletService.loadMoney(userId, amount, role);

    res.json({
      success: true,
      message: "Wallet loaded successfully",
      wallet,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getWalletBalance = async (req, res) => {
  try {
    const wallet = await walletService.getWallet(req.user.userId);

    res.json({
      success: true,
      balance: wallet.balance,
      wallet,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;

    const transactions = await walletService.getUserTransactions(
      userId,
      parseInt(page),
      parseInt(limit),
    );

    res.json({
      success: true,
      ...transactions,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
