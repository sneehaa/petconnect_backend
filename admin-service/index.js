// ----------------------
// index.js - Admin Service
// ----------------------

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

const logger = require("./utils/logger");

// ----------------------
// Route Imports
// ----------------------
const authMiddleware = require("./middleware/auth.middleware");
const adminMiddleware = require("./middleware/admin.middleware");

const adminRoutes = require("./routes"); // Main admin routes index.js
const dashboardRoutes = require("./routes/dashboard.routes"); // Dashboard stats + events

// ----------------------
// App Initialization
// ----------------------
const app = express();

// ----------------------
// Middleware
// ----------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // HTTP request logging

// ----------------------
// Routes
// ----------------------

// Dashboard routes (stats + microservice events)
// Only admins can access stats routes
app.use("/api/admin/dashboard", authMiddleware, adminMiddleware, dashboardRoutes);

// Mount main admin routes (Users, Businesses, Pets, Transactions)
// All routes inside routes/index.js already use auth + admin middleware
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/admin/health", (req, res) => {
  res.json({ success: true, message: "Admin service running" });
});

// Root check
app.get("/", (req, res) => {
  res.json({ success: true, message: "Admin service is running" });
});

// ----------------------
// Global Error Handler
// ----------------------
app.use((err, req, res, next) => {
  logger.error(err.stack || err);
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});

// ----------------------
// Database Connection
// ----------------------
const DB_URI = process.env.DB_URL || "mongodb://localhost:27017/petconnect";

mongoose
  .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info("MongoDB connected successfully"))
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  });

// ----------------------
// Start Server
// ----------------------
const PORT = process.env.PORT || 5510;
app.listen(PORT, () => {
  logger.info(`Admin service running on port ${PORT}`);
  logger.info("Waiting for events from User, Business, Pet, and Transaction services...");
});
