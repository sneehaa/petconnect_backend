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

        await rabbitmq.publish(
          process.env.PET_EXCHANGE,
          "pet.creation.completed",
          {
            petId: pet._id,
            requestedBy: data.requestedBy,
            status: "success",
          },
        );
      } catch (err) {
        await rabbitmq.publish(
          process.env.PET_EXCHANGE,
          "pet.creation.failed",
          {
            businessId: data.businessId,
            requestedBy: data.requestedBy,
            reason: err.message,
          },
        );
      }
    },
  );

  rabbitmq.consume(
    process.env.PET_EXCHANGE,
    process.env.PET_UPDATE_QUEUE,
    "pet.update.requested",
    async (data) => {
      try {
        await petService.updatePetDirect(data.petId, data.updateData);

        await rabbitmq.publish(process.env.PET_EXCHANGE, "pet.updated", {
          petId: data.petId,
          updates: data.updateData,
        });
      } catch (err) {
        await rabbitmq.publish(process.env.PET_EXCHANGE, "pet.update.failed", {
          petId: data.petId,
          reason: err.message,
        });
      }
    },
  );

  rabbitmq.consume(
    process.env.ADOPTION_EXCHANGE,
    process.env.PET_ADOPTION_QUEUE,
    "adoption.*",
    async (data, routingKey) => {
      switch (routingKey) {
        case "adoption.approved":
          return handleAdoptionApproved(data);
        case "adoption.rejected":
        case "adoption.cancelled":
          return handleAdoptionCancelled(data);
        case "adoption.completed":
          return handleAdoptionCompleted(data);
      }
    },
  );

  rabbitmq.consume(
    process.env.BUSINESS_EXCHANGE,
    process.env.PET_BUSINESS_VALIDATION_QUEUE,
    "business.validation.response.*",
    async (res, routingKey) => {
      const correlationId = routingKey.split(".")[3];
      const handler = pendingValidations.get(correlationId);

      if (!handler) return;

      pendingValidations.delete(correlationId);

      if (res.valid && res.status === "Approved") handler.resolve(res);
      else handler.reject(new Error("Business not approved"));
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

async function handleAdoptionApproved(data) {
  await Pet.findByIdAndUpdate(data.petId, { available: false });
  await rabbitmq.publish(process.env.PET_EXCHANGE, "pet.adopted", {
    petId: data.petId,
  });
}

async function handleAdoptionCancelled(data) {
  await Pet.findByIdAndUpdate(data.petId, { available: true });
  await rabbitmq.publish(process.env.PET_EXCHANGE, "pet.available", {
    petId: data.petId,
  });
}

async function handleAdoptionCompleted(data) {
  await Pet.findByIdAndUpdate(data.petId, {
    available: false,
    adoptedBy: data.userId,
    adoptedAt: new Date(),
  });
}
