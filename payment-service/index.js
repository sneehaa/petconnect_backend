import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./database/db.js";
import paymentRoutes from "./routes/payment.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import receiptRoutes from "./routes/receipt.routes.js";
import errorHandler from "./middleware/error.middleware.js";
import countRoutes from "./routes/count.routes.js"; // ✅ ES Module import


const app = express();

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/payments", paymentRoutes);
app.use("/transactions", transactionRoutes);
app.use("/receipts", receiptRoutes);
app.use("/api/transactions", countRoutes); // ✅ Using imported countRoutes


// Error handler (should be after all routes)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5006;
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});
