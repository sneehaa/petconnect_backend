const Wallet = require("../models/wallet.model");

exports.findByUserId = async (userId, session = null) => {
  const query = Wallet.findOne({ userId: userId.toString() });
  if (session) query.session(session);
  return await query.exec();
};

exports.createWallet = async (walletData, session = null) => {
  const newWallet = new Wallet(walletData);
  if (session) {
    await newWallet.save({ session });
    return newWallet;
  }
  return await newWallet.save();
};

exports.updateWallet = async (wallet, session = null) => {
  if (session) {
    return await wallet.save({ session });
  }
  return await wallet.save();
};

exports.getAllWallets = async (session = null) => {
  const query = Wallet.find();
  if (session) query.session(session);
  return await query.exec();
};

exports.addTransaction = async (userId, transactionData, session = null) => {
  const query = Wallet.findOneAndUpdate(
    { userId: userId.toString() },
    { $push: { transactions: transactionData } },
    { new: true },
  );

  if (session) query.session(session);
  return await query.exec();
};
