const Adoption = require("../models/adoption.model");

class AdoptionRepository {
  create(data) {
    return Adoption.create(data);
  }

  findById(id) {
    return Adoption.findById(id);
  }

  findByUser(userId) {
    return Adoption.find({ userId }).sort({ createdAt: -1 });
  }

  findByPet(petId) {
    return Adoption.find({ petId }).sort({ createdAt: -1 });
  }

  findByBusiness(businessId) {
    return Adoption.find({ businessId }).sort({ createdAt: -1 });
  }

  findUserPetAdoption(userId, petId) {
    return Adoption.findOne({ userId, petId });
  }

  updateStatus(adoptionId, status) {
    return Adoption.findByIdAndUpdate(adoptionId, { status }, { new: true });
  }

  markPaid(adoptionId, paymentId) {
    return Adoption.findByIdAndUpdate(
      adoptionId,
      {
        status: "completed",
        "payment.paymentId": paymentId,
        "payment.isPaid": true,
        "payment.paidAt": new Date()
      },
      { new: true }
    );
  }
}

module.exports = new AdoptionRepository();