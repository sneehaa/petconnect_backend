import Transaction from "../models/transaction.model.js";

export const getMyTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};
