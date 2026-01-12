import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1️⃣ Check if header exists
  if (!authHeader) {
    console.log("AUTH HEADER MISSING");   // debug
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  // 2️⃣ Check if token exists
  if (!token) {
    console.log("TOKEN MISSING");   // debug
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    // 3️⃣ Verify token
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log("JWT VERIFIED:", req.user.id); // debug
    next();
  } catch (err) {
    console.error("JWT VERIFICATION ERROR:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
