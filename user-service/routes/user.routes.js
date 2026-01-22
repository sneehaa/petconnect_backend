const express = require('express');
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authGuard, authGuardAdmin } = require('../middelware/authGuard');


//creating user api
router.post('/register', userController.register);

//creating login api
router.post('/login', userController.loginUser);

router.get("/profile/:userId", authGuard, userController.getUserProfile);

router.get("/getAll", authGuard, authGuardAdmin, userController.getAllUsers);

router.put("/edit/:userId", authGuard, userController.editUserProfile);

router.delete('/delete/:userId', authGuard, userController.deleteUserAccount);

// Route to send OTP via SMS
router.post('/sendOTP', userController.sendOTP)
router.get("/count", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ totalUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users count" });
  }
});

module.exports = router;