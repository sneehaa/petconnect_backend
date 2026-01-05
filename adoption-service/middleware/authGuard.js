const jwt = require("jsonwebtoken");

// Protect route: check JWT
const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: "Authorization header missing!" });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: "Token missing!" });

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decodedData.id,
      role: decodedData.role,
      permissions: decodedData.permissions
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token!" });
  }
};


// Role-based authorization middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient role" });
    }
    next();
  };
};

// Optional admin-specific guard
const authGuardAdmin = (req, res, next) => {
  authGuard(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }
    next();
  });
};

module.exports = {
  authGuard,
  authGuardAdmin,
  authorize,
};
