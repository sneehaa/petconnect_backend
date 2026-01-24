const adoptionRepo = require("../repositories/adoption.repository");
const rabbitmq = require("../utils/rabbitMQ");
const crypto = require("crypto");

const pendingPetValidations = new Map();

class AdoptionService {
  async applyAdoption(userId, petId, data) {
    const petInfo = await this.validatePetAndGetBusiness(petId);
    if (!petInfo.petDetails.available || petInfo.petDetails.isBooked) {
      throw new Error(
        "This pet is currently unavailable or booked by another user",
      );
    }
    const existing = await adoptionRepo.findUserPetAdoption(userId, petId);
    if (existing) throw new Error("Already applied for this pet");
    const adoption = await adoptionRepo.create({
      petId,
      userId,
      businessId: petInfo.businessId,
      status: "pending",
      message: data.message || "",
    });
    return adoption;
  }

  validatePetAndGetBusiness(petId) {
    return new Promise((resolve, reject) => {
      const correlationId = crypto.randomUUID();
      pendingPetValidations.set(correlationId, { resolve, reject });
      rabbitmq.publish(process.env.PET_EXCHANGE, "pet.validation.request", {
        petId,
        correlationId,
      });
      setTimeout(() => {
        if (pendingPetValidations.has(correlationId)) {
          pendingPetValidations.delete(correlationId);
          reject(new Error("Pet validation timeout"));
        }
      }, 10000);
    });
  }

  handleValidationResponse(res, correlationId) {
    const handler = pendingPetValidations.get(correlationId);
    if (!handler) return;
    pendingPetValidations.delete(correlationId);
    if (res.valid) handler.resolve(res);
    else handler.reject(new Error(res.reason || "Invalid pet"));
  }

  async approveAdoption(adoptionId, businessId) {
    const adoption = await adoptionRepo.findById(adoptionId);
    if (!adoption) throw new Error("Adoption not found");
    if (adoption.businessId.toString() !== businessId.toString())
      throw new Error("Unauthorized");
    const petInfo = await this.validatePetAndGetBusiness(adoption.petId);
    adoption.status = "payment_pending";
    await adoption.save();
    await rabbitmq.publish(process.env.ADOPTION_EXCHANGE, "adoption.approved", {
      adoptionId: adoption._id,
      userId: adoption.userId,
      petId: adoption.petId,
      petName: petInfo.petDetails.name,
      businessId: adoption.businessId,
      adoptionFee: petInfo.petDetails.amount,
      status: "approved",
    });
    return adoption;
  }

  async rejectAdoption(adoptionId, businessId, reason) {
    const adoption = await adoptionRepo.findById(adoptionId);
    if (!adoption) throw new Error("Adoption not found");
    if (adoption.businessId.toString() !== businessId.toString())
      throw new Error("Unauthorized");
    const petInfo = await this.validatePetAndGetBusiness(adoption.petId);
    adoption.status = "rejected";
    adoption.rejectionReason = reason;
    await adoption.save();
    await rabbitmq.publish(process.env.ADOPTION_EXCHANGE, "adoption.rejected", {
      adoptionId: adoption._id,
      userId: adoption.userId,
      petId: adoption.petId,
      petName: petInfo.petDetails.name,
      reason: reason,
    });
    return adoption;
  }

  async markAdoptionPaid(adoptionId, userId, paymentId, amount) {
    const adoption = await adoptionRepo.markPaid(adoptionId, paymentId);
    await rabbitmq.publish(
      process.env.ADOPTION_EXCHANGE,
      "adoption.completed",
      {
        adoptionId: adoption._id,
        userId: adoption.userId,
        petId: adoption.petId,
        status: "completed",
      },
    );
    return adoption;
  }

  async getAdoptionStatus(userId, petId) {
    return await adoptionRepo.findUserPetAdoption(userId, petId);
  }

  async getAdoptionHistory(userId) {
    return await adoptionRepo.findByUser(userId);
  }

  async getAdoptionById(id) {
    return await adoptionRepo.findById(id);
  }

  async getAdoptionsByPet(petId) {
    return await adoptionRepo.findByPet(petId);
  }
}

module.exports = new AdoptionService();
