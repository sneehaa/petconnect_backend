const mongoose = require("mongoose");
const walletRepo = require("../repository/wallet.repository");
const redisClient = require("../utils/redisClient");
const rabbitmq = require("../utils/rabbitmq");
const { v4: uuidv4 } = require("uuid");

const PAYMENT_EXCHANGE = "payment_events_exchange";

function toObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ID format: ${id}`);
  }
  return new mongoose.Types.ObjectId(id);
}

async function updateCache(wallet) {
  if (!wallet) return;
  await redisClient.setEx(
    `wallet:${wallet.userId}`,
    300,
    JSON.stringify(wallet),
  );
}

exports.loadMoney = async (userId, amount, role) => {
  const userObjectId = toObjectId(userId);
  let wallet = await walletRepo.findByUserId(userObjectId);

  if (!wallet) {
    wallet = await walletRepo.createWallet({
      userId: userObjectId,
      balance: amount,
      role,
    });
  } else {
    wallet.balance += amount;
    wallet.transactions.push({
      transactionId: `LOAD${Date.now()}${uuidv4().slice(0, 6)}`,
      type: "credit",
      amount: amount,
      description: `Wallet top-up`,
      status: "success",
    });
    await walletRepo.updateWallet(wallet);
  }

  await updateCache(wallet);
  return wallet;
};

exports.getWallet = async (userId) => {
  const cached = await redisClient.get(`wallet:${userId}`);
  if (cached) return JSON.parse(cached);

  const wallet = await walletRepo.findByUserId(toObjectId(userId));
  if (!wallet) throw new Error("Wallet not found");

  await updateCache(wallet);
  return wallet;
};

exports.getAllWallets = async () => {
  return await walletRepo.getAllWallets();
};

exports.holdMoneyForAdoption = async (userId, adoptionId, amount) => {
  const wallet = await walletRepo.findByUserId(toObjectId(userId));
  if (!wallet) throw new Error("Wallet not found");

  const totalHeld = wallet.holds.reduce((sum, h) => sum + h.amount, 0);
  const availableBalance = wallet.balance - totalHeld;

  if (availableBalance < amount)
    throw new Error("Insufficient balance to hold");

  wallet.holds.push({
    adoptionId: toObjectId(adoptionId),
    amount,
  });

  wallet.transactions.push({
    transactionId: `HOLD${Date.now()}${uuidv4().slice(0, 6)}`,
    type: "hold",
    amount: amount,
    description: `Hold for adoption #${adoptionId}`,
    referenceId: toObjectId(adoptionId),
    referenceModel: "Adoption",
    status: "success",
  });

  await walletRepo.updateWallet(wallet);
  await updateCache(wallet);

  await rabbitmq.publish(PAYMENT_EXCHANGE, "payment.hold.confirmed", {
    userId,
    adoptionId,
    amount,
  });
  return wallet;
};

exports.releaseHold = async (userId, adoptionId) => {
  const wallet = await walletRepo.findByUserId(toObjectId(userId));
  if (!wallet) throw new Error("Wallet not found");

  const adoptionObjectId = toObjectId(adoptionId);
  const hold = wallet.holds.find((h) => h.adoptionId.equals(adoptionObjectId));

  if (hold) {
    wallet.holds = wallet.holds.filter(
      (h) => !h.adoptionId.equals(adoptionObjectId),
    );

    wallet.transactions.push({
      transactionId: `REL${Date.now()}${uuidv4().slice(0, 6)}`,
      type: "release",
      amount: hold.amount,
      description: `Hold released for adoption #${adoptionId}`,
      referenceId: adoptionObjectId,
      referenceModel: "Adoption",
      status: "success",
    });

    await walletRepo.updateWallet(wallet);
    await updateCache(wallet);

    await rabbitmq.publish(PAYMENT_EXCHANGE, "payment.hold.released", {
      userId,
      adoptionId,
    });
  }

  return wallet;
};

exports.getUserTransactions = async (userId, page = 1, limit = 10) => {
  const wallet = await exports.getWallet(userId);
  if (!wallet) throw new Error("Wallet not found");

  const startIdx = (page - 1) * limit;
  const endIdx = startIdx + limit;

  const transactions = wallet.transactions || [];
  return {
    transactions: transactions.slice(startIdx, endIdx),
    total: transactions.length,
    page,
    totalPages: Math.ceil(transactions.length / limit),
  };
};

exports.getBusinessEarnings = async (businessId) => {
  const wallet = await exports.getWallet(businessId);
  if (!wallet) throw new Error("Business wallet not found");

  const earnings = wallet.transactions.filter(
    (t) => t.type === "credit" && t.status === "success",
  );

  return {
    totalEarnings: wallet.balance,
    totalTransactions: earnings.length,
    recentTransactions: earnings.slice(0, 10),
  };
};
