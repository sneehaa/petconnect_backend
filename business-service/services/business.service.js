const axios = require("axios");

class BusinessService {
  async approveAdoption(businessId, applicationId) {
    const DASHBOARD_URL = "http://user-dashboard-service:5600";

    try {
      const response = await axios.put(
        `${DASHBOARD_URL}/api/adoption-applications/approve/${applicationId}`,
        {}, // empty body
        {
          headers: { "x-business-id": businessId }
        }
      );

      return response.data;
    } catch (err) {
      if (err.response) {
        throw new Error(err.response.data.message || "Dashboard service error");
      } else {
        throw new Error(err.message || "Failed to call dashboard service");
      }
    }
  }

  async rejectAdoption(businessId, applicationId, reason) {
    const DASHBOARD_URL = "http://user-dashboard-service:5600";

    try {
      const response = await axios.put(
        `${DASHBOARD_URL}/api/adoption-applications/reject/${applicationId}`,
        { reason },
        {
          headers: { "x-business-id": businessId }
        }
      );

      return response.data;
    } catch (err) {
      if (err.response) {
        throw new Error(err.response.data.message || "Dashboard service error");
      } else {
        throw new Error(err.message || "Failed to call dashboard service");
      }
    }
  }
}

module.exports = new BusinessService();
