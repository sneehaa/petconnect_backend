// importing
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./database/db");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

// routes
const paymentRoutes = require("./routes/payment.routes");
const transactionRoutes = require("./routes/transaction.routes");
const receiptRoutes = require("./routes/receipt.routes");
const countRoutes = require("./routes/count.routes");

// app init
const app = express();

// config
dotenv.config();

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// db
connectDB();

// routes
app.use("/api/payments", paymentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/counts", countRoutes);

// test route
app.get("/test", (req, res) => {
  res.status(200).send("Hello");
});

// server
const PORT = process.env.PORT || 5502;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// exporting app
module.exports = app;
