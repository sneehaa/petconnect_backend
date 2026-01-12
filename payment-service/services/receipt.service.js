import Receipt from "../models/receipt.model.js";
import generateReceiptNo from "../utils/generateReceiptNo.js";

export const createReceipt = async ({ paymentId, issuedTo, receiptUrl }) => {
  const receipt = await Receipt.create({
    paymentId,
    issuedTo,
    receiptNumber: generateReceiptNo(),
    receiptUrl,
  });
  return receipt;
};

export const getReceipt = async (paymentId) => {
  const receipt = await Receipt.findOne({ paymentId });
  return receipt;
};
