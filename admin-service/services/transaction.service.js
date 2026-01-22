const Transaction = require("../database/models/Transaction");

class TransactionService {
  async getAllTransactions() {
    return Transaction.find();
  }

  async getTransactionById(id) {
    const txn = await Transaction.findById(id);
    if (!txn) throw new Error("Transaction not found");
    return txn;
  }
}

module.exports = new TransactionService();
