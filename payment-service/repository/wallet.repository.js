const Wallet = require("../models/wallet.model");

exports.findByUserId = async (userId, session = null) => {
  console.log(`DEBUG WALLET REPO: Finding wallet for userId: ${userId}`);
  const query = Wallet.findOne({ userId: userId.toString() });
  if (session) query.session(session);
  const result = await query.exec();
  console.log(`DEBUG WALLET REPO: Found wallet:`, result ? "Yes" : "No");
  return result;
};

exports.createWallet = async (walletData, session = null) => {
  console.log(`DEBUG WALLET REPO: Creating wallet for:`, walletData);
  const newWallet = new Wallet(walletData);
  if (session) {
    await newWallet.save({ session });
    return newWallet;
  }
  return await newWallet.save();
};

exports.updateWallet = async (wallet, session = null) => {
  console.log(`DEBUG WALLET REPO: Updating wallet:`, wallet._id);
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
  console.log(`DEBUG WALLET REPO: Adding transaction for userId: ${userId}`);
  const query = Wallet.findOneAndUpdate(
    { userId: userId.toString() },
    { $push: { transactions: transactionData } },
    { new: true },
  );

  if (session) query.session(session);
  return await query.exec();
};
