import Receipt from "../models/receipt.model.js";

export const getReceiptByPaymentId = async (req, res, next) => {
  try {
    const receipt = await Receipt.findOne({ paymentId: req.params.paymentId });
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });
    res.json(receipt);
  } catch (error) {
    next(error);
  }
};
