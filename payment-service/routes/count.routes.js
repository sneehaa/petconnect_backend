// routes/count.routes.js
import express from "express";
import Transaction from "../models/transaction.model.js"; // ✅ import your model

const router = express.Router();

// Route: GET /count
router.get("/count", async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments();
    res.json({ totalTransactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch transaction count" });
  }
});

export default router; // ✅ ES Module export
