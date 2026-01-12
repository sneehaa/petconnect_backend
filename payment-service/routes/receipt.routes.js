import express from "express";
import Receipt from "../models/receipt.model.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:paymentId", authMiddleware, async (req, res) => {
  const receipt = await Receipt.findOne({ paymentId: req.params.paymentId });
  res.json(receipt);
});

export default router;
