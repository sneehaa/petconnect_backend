const rabbitmq = require("../utils/rabbitMQ");
const adoptionService = require("../services/adoption.service");
const adoptionEvents = require("../events/adoption.events");

const BUSINESS_EXCHANGE = process.env.BUSINESS_EXCHANGE;
const PAYMENT_EXCHANGE = process.env.PAYMENT_EXCHANGE;
const PET_EXCHANGE = process.env.PET_EXCHANGE;

exports.setupAdoptionListeners = () => {
  rabbitmq.consume(
    PET_EXCHANGE,
    process.env.ADOPTION_PET_VALIDATION_QUEUE,
    "pet.validation.response.*",
    async (res, routingKey) => {
      const parts = routingKey.split(".");
      const correlationId = parts[parts.length - 1];
      adoptionService.handleValidationResponse(res, correlationId);
    },
  );

  rabbitmq.consume(
    BUSINESS_EXCHANGE,
    process.env.ADOPTION_APPROVAL_QUEUE,
    "adoption.approval.requested",
    async (data) => {
      try {
        await adoptionEvents.approveAdoptionWithEvent(
          data.applicationId,
          data.businessId,
        );
      } catch (err) {
        console.error("Async approval failed:", err.message);
      }
    },
  );

  rabbitmq.consume(
    BUSINESS_EXCHANGE,
    process.env.ADOPTION_REJECTION_QUEUE,
    "adoption.rejection.requested",
    async (data) => {
      try {
        await adoptionEvents.rejectAdoptionWithEvent(
          data.applicationId,
          data.businessId,
          data.reason,
        );
      } catch (err) {
        console.error("Async rejection failed:", err.message);
      }
    },
  );

  rabbitmq.consume(
    process.env.PAYMENT_EXCHANGE,
    process.env.ADOPTION_PAYMENT_QUEUE,
    "payment.success",
    async (data) => {
      try {
        console.log(
          `Payment success received for adoption: ${data.adoptionId}`,
        );
        await adoptionService.markAdoptionPaid(
          data.adoptionId,
          data.userId,
          data.paymentId,
          data.amount,
        );
      } catch (err) {
        console.error("Error marking adoption as paid:", err.message);
      }
    },
  );
};
