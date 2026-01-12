import express from "express";
import Transaction from "../models/transaction.model.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/my-history", authMiddleware, async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user.id });
  res.json(transactions);
});

export default router;
