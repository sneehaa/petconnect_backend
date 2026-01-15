const express = require("express");
const router = express.Router();

const adminMiddleware = require("../middleware/admin.middleware");
const userController = require("../controllers/user.controller"); // make sure path matches exactly

// GET /api/admin/users → admin only
router.get("/", adminMiddleware, userController.getAllUsers);

module.exports = router;
