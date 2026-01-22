// routes/index.js
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

// Mount sub-routes
router.use("/users", require("./users.routes"));
router.use("/businesses", require("./businesses.routes"));
router.use("/pets", require("./pets.routes"));
router.use("/transactions", require("./transactions.routes"));

// Optionally, mount middleware here if you want all routes protected
// router.use(authMiddleware, adminMiddleware);

module.exports = router;
