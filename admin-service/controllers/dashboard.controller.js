const axios = require("axios");
const response = require("../utils/response");
const logger = require("../utils/logger");

// ----------------------
// Dashboard stats endpoint
// ----------------------
exports.getDashboardStats = async (req, res) => {
  try {
    // Microservice URLs from environment
    const USER_SERVICE_URL = process.env.USER_SERVICE_URL; // e.g., http://user-service:5500
    const BUSINESS_SERVICE_URL = process.env.BUSINESS_SERVICE_URL; // e.g., http://business-service:5520
    const PET_SERVICE_URL = process.env.PET_SERVICE_URL; // e.g., http://pet-service:5530
    const TRANSACTION_SERVICE_URL = process.env.TRANSACTION_SERVICE_URL; // e.g., http://transaction-service:5540

    // Fetch counts in parallel
    const [usersRes, businessesRes, petsRes, transactionsRes] = await Promise.all([
      axios.get(`${USER_SERVICE_URL}/api/users/count`),
      axios.get(`${BUSINESS_SERVICE_URL}/api/business/admin/count`),
      axios.get(`${PET_SERVICE_URL}/api/pets/count`),
      axios.get(`${TRANSACTION_SERVICE_URL}/api/transactions/count`)
    ]);

    // Aggregate stats
    const stats = {
      totalUsers: usersRes.data.totalUsers || 0,
      totalBusinesses: businessesRes.data.totalBusinesses || 0,
      totalPets: petsRes.data.totalPets || 0,
      totalTransactions: transactionsRes.data.totalTransactions || 0
    };

    return response.success(res, { stats });

  } catch (err) {
    logger.error("Dashboard stats fetch error:", err.message);
    return response.error(res, "Failed to fetch dashboard stats", 500);
  }
};
