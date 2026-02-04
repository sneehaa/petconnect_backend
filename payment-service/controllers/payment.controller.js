const paymentService = require("../services/payment.service");
const walletService = require("../services/wallet.service");

exports.getPaymentSummary = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;
    const payment = await paymentService.getPaymentById(paymentId);
    const wallet = await walletService.getWalletById(userId.toString());
    const canProceed = wallet.balance >= payment.amount;
    res.json({
      success: true,
      summary: {
        requiredAmount: payment.amount,
        currentBalance: wallet.balance,
        shortfall: canProceed ? 0 : payment.amount - wallet.balance,
        canProceed,
      },
    });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

exports.initiatePayment = async (req, res) => {
  try {
    const { adoptionId } = req.body;
    const userId = req.user.id;

    const existingPayment =
      await paymentService.getPaymentByAdoptionId(adoptionId);

    if (existingPayment) {
      return res.json({
        success: true,
        message: "Payment already initiated",
        payment: existingPayment,
      });
    }
    return res.status(400).json({
      success: false,
      message:
        "No payment record found. Please ensure the adoption has been approved first.",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { paymentId, paymentMethod } = req.body;
    const payment = await paymentService.processPaymentDirect(
      paymentId,
      paymentMethod || "wallet",
    );
    res.json({
      success: true,
      message: "Payment processed successfully",
      payment,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.loadWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    const role = req.user.role;
    const wallet = await walletService.loadMoneyDirect(
      userId.toString(),
      amount,
      role.toLowerCase(),
    );
    res.json({ success: true, wallet });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const wallet = await walletService.getWalletById(userId.toString());
    res.json({ success: true, balance: wallet.balance });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const history = await walletService.getUserTransactions(
      userId.toString(),
      parseInt(page),
      parseInt(limit),
    );
    res.json({ success: true, ...history });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const payments = await paymentService.getPaymentsByUserDirect(
      userId.toString(),
      parseInt(page),
      parseInt(limit),
    );
    res.json({ success: true, payments });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getPaymentDetails = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.paymentId);
    res.json({ success: true, payment });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

exports.getBusinessEarnings = async (req, res) => {
  try {
    const businessId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const history = await paymentService.getPaymentsByBusiness(
      businessId.toString(),
      parseInt(page),
      parseInt(limit),
    );
    const stats = await paymentService.getBusinessStatsDirect(
      businessId.toString(),
    );
    res.json({ success: true, history, stats });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getBusinessWalletBalance = async (req, res) => {
  try {
    const businessId = req.user.id;
    const wallet = await walletService.getWalletById(businessId.toString());
    res.json({ success: true, balance: wallet.balance });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getBusinessTransactions = async (req, res) => {
  try {
    const businessId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const transactions = await walletService.getBusinessEarnings(
      businessId.toString(),
    );
    res.json({ success: true, ...transactions });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, ...filters } = req.query;
    const transactions = await paymentService.getAllTransactionsDirect(
      parseInt(page),
      parseInt(limit),
      filters,
    );
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllWallets = async (req, res) => {
  try {
    const wallets = await walletService.getAllWallets();
    res.json({ success: true, wallets });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
