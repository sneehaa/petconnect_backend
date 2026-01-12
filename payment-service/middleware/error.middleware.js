// payment-service/middleware/error.middleware.js

const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ message });
};

export default errorHandler;
