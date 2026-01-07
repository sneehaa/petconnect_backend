const jwt = require("jsonwebtoken");

// Business auth guard
const authGuardBusiness = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔒 Business-only access
    if (decoded.role !== "BUSINESS") {
      return res.status(403).json({
        success: false,
        message: "Business access only",
      });
    }

    // Attach business identity
    req.business = {
      id: decoded.id,
    };

    next();
  } catch (error) {
    console.error("Invalid token:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const authGuardAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing!"
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token missing!"
    });
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decodedData.id,
      role: decodedData.role,
      permissions: decodedData.permissions
    };

    if (decodedData.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Admin only"
      });
    }

    next();
  } catch (error) {
    console.error("Invalid token!", error);
    res.status(401).json({
      success: false,
      message: "Invalid token!"
    });
  }
};


module.exports = {
  authGuardBusiness,
  authGuardAdmin,
};
