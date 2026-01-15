// routes/index.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

// Mount dashboard routes (admin only)
router.use("/dashboard", authMiddleware, adminMiddleware, require("./dashboard.routes"));

// Mount user management routes (admin only)
router.use("/users", authMiddleware, adminMiddleware, require("./users.routes"));

// Mount business management routes (admin only)
router.use("/businesses", authMiddleware, adminMiddleware, require("./businesses.routes"));

// Mount pet management routes (admin only)
router.use("/pets", authMiddleware, adminMiddleware, require("./pets.routes"));

// Mount transaction/payment routes (admin only)
router.use("/transactions", authMiddleware, adminMiddleware, require("./transactions.routes"));

module.exports = router;
