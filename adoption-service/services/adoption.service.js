const adoptionRepo = require("../repositories/adoption.repository");
const rabbitmq = require("../utils/rabbitMQ");
const crypto = require("crypto");

const pendingPetValidations = new Map();

class AdoptionService {
  async applyAdoption(userId, petId, data) {
    const petInfo = await this.validatePetAndGetBusiness(petId);
    if (petInfo.petDetails.status !== "available") {
      throw new Error("Pet is not available");
    }
    const existing = await adoptionRepo.findUserPetAdoption(userId, petId);
    if (existing) throw new Error("Already applied");
    return await adoptionRepo.create({
      petId,
      userId,
      businessId: petInfo.businessId,
      status: "pending",
      message: data.message || "",
    });
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
          reject(new Error("Timeout"));
        }
      }, 10000);
    });
  }

  handleValidationResponse(res, correlationId) {
    const handler = pendingPetValidations.get(correlationId);
    if (!handler) return;
    pendingPetValidations.delete(correlationId);
    if (res.valid) handler.resolve(res);
    else handler.reject(new Error(res.reason));
  }

  async approveAdoption(adoptionId, businessId) {
    const adoption = await adoptionRepo.findById(adoptionId);
    if (!adoption || adoption.businessId.toString() !== businessId.toString())
      throw new Error("Unauthorized or not found");
    const petInfo = await this.validatePetAndGetBusiness(adoption.petId);
    adoption.status = "payment_pending";
    await adoption.save();
    await rabbitmq.publish(process.env.ADOPTION_EXCHANGE, "adoption.approved", {
      adoptionId: adoption._id,
      userId: adoption.userId,
      petId: adoption.petId,
      businessId: adoption.businessId,
      adoptionFee: petInfo.petDetails.amount,
    });
    return adoption;
  }

  async finalizeAdoptionDirect(adoptionId, petId, userId, paymentId) {
    const updatedAdoption = await adoptionRepo.markPaid(adoptionId, paymentId);

    if (!updatedAdoption) {
      throw new Error("Adoption not found during finalization");
    }
    await rabbitmq.publish(
      process.env.ADOPTION_EXCHANGE,
      "adoption.completed",
      {
        adoptionId: updatedAdoption._id,
        petId: petId || updatedAdoption.petId,
        userId: userId || updatedAdoption.userId,
        status: "completed",
      },
    );

    return updatedAdoption;
  }

  async rejectAdoption(adoptionId, businessId, reason) {
    const adoption = await adoptionRepo.findById(adoptionId);
    if (!adoption || adoption.businessId.toString() !== businessId.toString())
      throw new Error("Unauthorized");
    adoption.status = "rejected";
    adoption.rejectionReason = reason;
    await adoption.save();
    await rabbitmq.publish(process.env.ADOPTION_EXCHANGE, "adoption.rejected", {
      adoptionId: adoption._id,
      petId: adoption.petId,
      reason,
    });
    return adoption;
  }
}

module.exports = new AdoptionService();
