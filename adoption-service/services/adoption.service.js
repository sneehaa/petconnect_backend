const adoptionRepo = require("../repositories/adoption.repository");
const rabbitmq = require("../utils/rabbitMQ");
const crypto = require("crypto");

const pendingPetValidations = new Map();

class AdoptionService {
  async applyAdoption(userId, petId, applicationData) {
    const petInfo = await this.validatePetAndGetBusiness(petId);

    if (petInfo.petDetails.status !== "available") {
      throw new Error("Pet is not available for adoption");
    }

    const existing = await adoptionRepo.findUserPetAdoption(userId, petId);
    if (existing && existing.status !== "rejected") {
      throw new Error("You already have an active application for this pet");
    }

    const adoption = await adoptionRepo.create({
      petId,
      userId,
      businessId: petInfo.businessId,
      status: "pending",
      applicationDetails: {
        fullName: applicationData.fullName,
        phoneNumber: applicationData.phoneNumber,
        address: applicationData.address,
        homeType: applicationData.homeType,
        hasYard: applicationData.hasYard,
        employmentStatus: applicationData.employmentStatus,
        numberOfAdults: applicationData.numberOfAdults,
        numberOfChildren: applicationData.numberOfChildren,
        hasOtherPets: applicationData.hasOtherPets,
        otherPetsDetails: applicationData.otherPetsDetails,
        hoursPetAlone: applicationData.hoursPetAlone,
        previousPetExperience: applicationData.previousPetExperience,
        message: applicationData.message,
      },
    });

    await rabbitmq.publish(
      process.env.NOTIFICATION_EXCHANGE,
      "adoption.new_application",
      {
        businessId: petInfo.businessId,
        userName: applicationData.fullName,
        petName: petInfo.petDetails.name,
        petId: petId,
        adoptionId: adoption._id,
        userId: userId,
      },
    );

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
          reject(new Error("Pet validation service timeout"));
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
    if (!adoption || adoption.businessId.toString() !== businessId.toString()) {
      throw new Error("Unauthorized or application not found");
    }

    const petInfo = await this.validatePetAndGetBusiness(adoption.petId);

    adoption.status = "payment_pending";
    adoption.payment = {
      ...adoption.payment,
      amount: petInfo.petDetails.amount,
    };

    await adoption.save();

    await rabbitmq.publish(process.env.ADOPTION_EXCHANGE, "adoption.approved", {
      adoptionId: adoption._id,
      userId: adoption.userId,
      petId: adoption.petId,
      businessId: adoption.businessId,
      petName: petInfo.petDetails.name,
      adoptionFee: petInfo.petDetails.amount,
    });

    return adoption;
  }

  async finalizeAdoptionDirect(adoptionId, petId, userId, paymentId) {
    const updatedAdoption = await adoptionRepo.markPaid(adoptionId, paymentId);

    if (!updatedAdoption) {
      throw new Error("Adoption record not found during finalization");
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
    if (!adoption || adoption.businessId.toString() !== businessId.toString()) {
      throw new Error("Unauthorized action");
    }

    adoption.status = "rejected";
    adoption.rejectionReason = reason;
    await adoption.save();

    await rabbitmq.publish(process.env.ADOPTION_EXCHANGE, "adoption.rejected", {
      adoptionId: adoption._id,
      userId: adoption.userId,
      petId: adoption.petId,
      petName: "the pet",
      reason: reason || "No reason provided",
    });

    return adoption;
  }

  async getAdoptionStatus(userId, petId) {
    return await adoptionRepo.findUserPetAdoption(userId, petId);
  }

  async getAdoptionsByPet(petId) {
    return await adoptionRepo.findByPet(petId);
  }

  async getAdoptionHistory(userId) {
    return await adoptionRepo.findByUser(userId);
  }

  async getAdoptionsByBusiness(businessId) {
    return await adoptionRepo.findByBusiness(businessId);
  }

  async getAdoptionById(id) {
    return await adoptionRepo.findById(id);
  }
}

module.exports = new AdoptionService();
