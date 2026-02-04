const jwt = require("jsonwebtoken");

const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing!",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token missing!",
    });
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decodedData.id,
      role: decodedData.role,
      permissions: decodedData.permissions,
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token!",
    });
  }
};

const authGuardAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing!",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token missing!",
    });
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decodedData.id,
      role: decodedData.role,
      permissions: decodedData.permissions,
    };

    if (decodedData.isAdmin !== true) {
      return res.status(403).json({
        success: false,
        message: "Permission denied!",
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token!",
    });
  }
};

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

    if (decoded.role !== "BUSINESS") {
      return res.status(403).json({
        success: false,
        message: "Business access only",
      });
    }

    req.business = { id: decoded.id };
    req.user = { id: decoded.id, role: decoded.role, userId: decoded.id };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = {
  authGuard,
  authGuardAdmin,
  authGuardBusiness,
};
