const adoptionRepo = require("../repositories/adoption.repository");
const axios = require("axios");

class AdoptionService {
  async applyAdoption(userId, petId, data, token) {
    const pet = await axios.get(`${process.env.PET_SERVICE_URL}/pets/${petId}`);
    if (!pet.data) throw new Error("Pet not found");

    const existing = await adoptionRepo.findUserPetAdoption(userId, petId);
    if (existing) throw new Error("Already applied for this pet");

    return adoptionRepo.create({
      petId,
      userId,
      businessId: pet.data.businessId,
      status: "pending"
    });
  }

  async getAdoptionStatus(userId, petId) {
    const adoption = await adoptionRepo.findUserPetAdoption(userId, petId);
    if (!adoption) throw new Error("No adoption found");
    return adoption;
  }

  async getAdoptionHistory(userId) {
    return adoptionRepo.findByUser(userId);
  }

  async getPetAdoptions(petId) {
    return adoptionRepo.findByPet(petId);
  }

  async getBusinessAdoptions(businessId) {
    return adoptionRepo.findByBusiness(businessId);
  }

  async approveAdoption(adoptionId, businessId) {
    const adoption = await adoptionRepo.findById(adoptionId);
    if (!adoption) throw new Error("Adoption not found");
    if (adoption.businessId !== businessId) throw new Error("Unauthorized");

    adoption.status = "payment_pending";
    await adoption.save();

    await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notify`, {
      userId: adoption.userId,
      type: "adoption_approved",
      message: "Your adoption request has been approved. Please proceed to payment."
    });

    return adoption;
  }

  async rejectAdoption(adoptionId, businessId, reason) {
    const adoption = await adoptionRepo.findById(adoptionId);
    if (!adoption) throw new Error("Adoption not found");
    if (adoption.businessId !== businessId) throw new Error("Unauthorized");

    adoption.status = "rejected";
    adoption.rejectionReason = reason;
    await adoption.save();

    await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notify`, {
      userId: adoption.userId,
      type: "adoption_rejected",
      message: `Your adoption request was rejected. Reason: ${reason}`
    });

    return adoption;
  }

  async markAdoptionPaid(adoptionId, paymentId) {
    const adoption = await adoptionRepo.findById(adoptionId);
    if (!adoption) throw new Error("Adoption not found");

    adoption.status = "completed";
    adoption.payment.paymentId = paymentId;
    adoption.payment.isPaid = true;
    adoption.payment.paidAt = new Date();
    await adoption.save();

    await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notify/business`, {
      businessId: adoption.businessId,
      type: "payment_received",
      message: `Payment received for adoption ${adoptionId}`
    });

    return adoption;
  }
}

module.exports = new AdoptionService();