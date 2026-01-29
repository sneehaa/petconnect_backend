const Business = require("../database/models/Business");

class BusinessService {
  async getAllBusinesses() {
    return Business.find();
  }

  async approveBusiness(id) {
    const business = await Business.findById(id);
    if (!business) throw new Error("Business not found");
    business.businessStatus = "Approved";
    await business.save();
    return business;
  }

  async rejectBusiness(id, reason) {
    const business = await Business.findById(id);
    if (!business) throw new Error("Business not found");
    business.businessStatus = "Rejected";
    business.rejectionReason = reason;
    await business.save();
    return business;
  }
}

module.exports = new BusinessService();
