const adoptionRepo = require("../repositories/adoption.repository");
const rabbitmq = require("../utils/rabbitMQ");

const ADOPTION_EXCHANGE = process.env.ADOPTION_EXCHANGE;
const PET_EXCHANGE = process.env.PET_EXCHANGE;

class AdoptionService {
  async applyAdoption(userId, petId, data) {
    const existing = await adoptionRepo.findUserPetAdoption(userId, petId);
    if (existing) throw new Error("Already applied for this pet");

    return new Promise((resolve, reject) => {
      const correlationId = Math.random().toString(36).substring(7);
      const replyQueue = `adoption_pet_check_${correlationId}`;

      rabbitmq.publish(PET_EXCHANGE, "pet.validation.request", {
        petId,
        correlationId,
        replyTo: replyQueue,
      });

      const timeout = setTimeout(
        () => reject(new Error("Pet validation timeout")),
        10000,
      );

      rabbitmq.consume(
        PET_EXCHANGE,
        replyQueue,
        `pet.validation.response.${correlationId}`,
        async (res) => {
          clearTimeout(timeout);
          if (!res.exists) return reject(new Error("Pet not found"));

          const adoption = await adoptionRepo.create({
            petId,
            userId,
            businessId: res.businessId,
            status: "pending",
            message: data.message || "",
          });

          await rabbitmq.publish(ADOPTION_EXCHANGE, "adoption.applied", {
            adoptionId: adoption._id,
            petId,
            userId,
            businessId: res.businessId,
          });

          resolve(adoption);
        },
      );
    });
  }

  async approveAdoption(adoptionId, businessId) {
    const adoption = await adoptionRepo.findById(adoptionId);
    if (!adoption) throw new Error("Adoption not found");
    if (adoption.businessId.toString() !== businessId.toString())
      throw new Error("Unauthorized");

    adoption.status = "payment_pending";
    await adoption.save();

    await rabbitmq.publish(ADOPTION_EXCHANGE, "adoption.approved", {
      adoptionId: adoption._id,
      userId: adoption.userId,
      petId: adoption.petId,
    });

    return adoption;
  }

  async rejectAdoption(adoptionId, businessId, reason) {
    const adoption = await adoptionRepo.findById(adoptionId);
    if (!adoption) throw new Error("Adoption not found");
    if (adoption.businessId.toString() !== businessId.toString())
      throw new Error("Unauthorized");

    adoption.status = "rejected";
    adoption.rejectionReason = reason;
    await adoption.save();

    await rabbitmq.publish(ADOPTION_EXCHANGE, "adoption.rejected", {
      adoptionId: adoption._id,
      userId: adoption.userId,
      reason,
    });

    return adoption;
  }

  async markAdoptionPaid(adoptionId, userId, paymentId, amount) {
    const adoption = await adoptionRepo.markPaid(adoptionId, paymentId);

    await rabbitmq.publish(ADOPTION_EXCHANGE, "adoption.completed", {
      adoptionId: adoption._id,
      userId: adoption.userId,
      petId: adoption.petId,
      amount,
    });

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
