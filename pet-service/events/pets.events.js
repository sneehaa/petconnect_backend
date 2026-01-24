const rabbitmq = require("../utils/rabbitMQ");
const petService = require("../services/pet.service");
const Pet = require("../models/pet.model");

exports.setupEventListeners = () => {
  rabbitmq.consume(
    process.env.ADOPTION_EXCHANGE,
    process.env.PET_ADOPTION_QUEUE,
    "adoption.#",
    async (data, routingKey) => {
      const petId = data.petId;
      if (!petId) return;

      let update = {};
      if (routingKey === "adoption.approved") {
        update = { status: "booked" };
      } else if (
        routingKey === "adoption.rejected" ||
        routingKey === "adoption.cancelled"
      ) {
        update = { status: "available" };
      } else if (routingKey === "adoption.completed") {
        update = {
          status: "adopted",
          adoptedBy: data.userId,
          adoptedAt: new Date(),
        };
      }

      if (Object.keys(update).length > 0) {
        await Pet.findByIdAndUpdate(petId, update);
      }
    },
  );

  rabbitmq.consume(
    process.env.PET_EXCHANGE,
    "pet.validation.queue",
    "pet.validation.request",
    async (data) => {
      try {
        const pet = await petService.getPetById(data.petId);
        await rabbitmq.publish(
          process.env.PET_EXCHANGE,
          `pet.validation.response.${data.correlationId}`,
          { valid: !!pet, petDetails: pet, businessId: pet?.businessId },
        );
      } catch (err) {
        await rabbitmq.publish(
          process.env.PET_EXCHANGE,
          `pet.validation.response.${data.correlationId}`,
          { valid: false, reason: err.message },
        );
      }
    },
  );
};
