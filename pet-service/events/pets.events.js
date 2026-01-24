const rabbitmq = require("../utils/rabbitMQ");
const petService = require("../services/pet.service");
const Pet = require("../models/pet.model");
const crypto = require("crypto");

const pendingValidations = new Map();

exports.setupEventListeners = () => {
  rabbitmq.consume(
    process.env.BUSINESS_EXCHANGE,
    process.env.PET_BUSINESS_QUEUE,
    "business.approved",
    async (data) => {
      console.log(`Business ${data.businessId} approved`);
    },
  );

  rabbitmq.consume(
    process.env.PET_EXCHANGE,
    process.env.PET_CREATION_QUEUE,
    "pet.creation.requested",
    async (data) => {
      try {
        await validateBusiness(data.businessId);
        const pet = await petService.createPetDirect({
          ...data,
          available: true,
        });
        await rabbitmq.publish(process.env.PET_EXCHANGE, "pet.created", {
          petId: pet._id,
          businessId: pet.businessId,
          name: pet.name,
        });
      } catch (err) {
        console.error("Pet creation failed", err);
      }
    },
  );

  rabbitmq.consume(
    process.env.ADOPTION_EXCHANGE,
    process.env.PET_ADOPTION_QUEUE,
    "adoption.#",
    async (data, routingKey) => {
      console.log(`Incoming Adoption Event: ${routingKey}`);

      const petId = data.petId;
      if (!petId) return console.error("No petId found in event data");

      if (routingKey === "adoption.approved") {
        console.log(`Marking pet ${petId} as BOOKED`);
        const result = await Pet.findByIdAndUpdate(
          petId,
          { available: false, isBooked: true },
          { new: true },
        );
        console.log(
          "Database update result:",
          result ? "Success" : "Pet not found",
        );
      } else if (
        routingKey === "adoption.rejected" ||
        routingKey === "adoption.cancelled"
      ) {
        console.log(`Marking pet ${petId} as AVAILABLE`);
        await Pet.findByIdAndUpdate(petId, {
          available: true,
          isBooked: false,
        });
      } else if (routingKey === "adoption.completed") {
        console.log(`Marking pet ${petId} as ADOPTED`);
        await Pet.findByIdAndUpdate(petId, {
          available: false,
          isBooked: false,
          adoptedBy: data.userId,
          adoptedAt: new Date(),
        });
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

function validateBusiness(businessId) {
  return new Promise((resolve, reject) => {
    const correlationId = crypto.randomUUID();
    pendingValidations.set(correlationId, { resolve, reject });
    rabbitmq.publish(
      process.env.BUSINESS_EXCHANGE,
      "business.validation.request",
      { businessId, correlationId },
    );
    setTimeout(() => {
      if (pendingValidations.has(correlationId)) {
        pendingValidations.delete(correlationId);
        reject(new Error("Business validation timeout"));
      }
    }, 10000);
  });
}
