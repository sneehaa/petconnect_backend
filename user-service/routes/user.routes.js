const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authGuard, authGuardAdmin } = require("../middleware/authGuard");

router.post("/register", userController.register);
router.post("/verify-email", userController.verifyEmail);
router.post("/login", userController.loginUser);
router.post("/send-otp", userController.sendOTP);

router.get("/profile/:userId", authGuard, userController.getUserProfile);
router.get("/getAll", authGuard, authGuardAdmin, userController.getAllUsers);
router.put("/edit/:userId", authGuard, userController.editUserProfile);
router.delete("/delete/:userId", authGuard, userController.deleteUserAccount);

module.exports = router;
