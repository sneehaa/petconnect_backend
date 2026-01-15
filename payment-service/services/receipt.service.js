const Receipt = require("../models/receipt.model");
const generateReceiptNo = require("../utils/generateReceiptNo");

const createReceipt = async ({ paymentId, issuedTo, receiptUrl }) => {
  const receipt = await Receipt.create({
    paymentId,
    issuedTo,
    receiptNumber: generateReceiptNo(),
    receiptUrl,
  });
  return receipt;
};

const getReceipt = async (paymentId) => {
  const receipt = await Receipt.findOne({ paymentId });
  return receipt;
};

module.exports = {
  createReceipt,
  getReceipt,
};
