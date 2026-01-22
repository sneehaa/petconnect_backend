// middleware/admin.middleware.js
const jwt = require("jsonwebtoken");
const User = require("../database/models/User");
const response = require("../utils/response");

const adminMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return response.error(res, "Unauthorized", 401);
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return response.error(res, "User not found", 401);

    if (!user.isAdmin) return response.error(res, "Admins only", 403);

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    return response.error(res, "Invalid or expired token", 401);
  }
};

module.exports = adminMiddleware;
