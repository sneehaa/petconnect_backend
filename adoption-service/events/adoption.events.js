const rabbitmq = require("../utils/rabbitMQ");
const adoptionService = require("../services/adoption.service");

const BUSINESS_EXCHANGE = process.env.BUSINESS_EXCHANGE;
const PAYMENT_EXCHANGE = process.env.PAYMENT_EXCHANGE;

exports.setupAdoptionListeners = () => {
  rabbitmq.consume(
    BUSINESS_EXCHANGE,
    process.env.ADOPTION_APPROVAL_QUEUE,
    "adoption.approval.requested",
    async (data) => {
      try {
        await adoptionService.approveAdoption(
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
        await adoptionService.rejectAdoption(
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
    PAYMENT_EXCHANGE,
    process.env.ADOPTION_PAYMENT_QUEUE,
    "payment.success",
    async (data) => {
      try {
        await adoptionService.markAdoptionPaid(
          data.adoptionId,
          data.userId,
          data.paymentId,
          data.amount,
        );
      } catch (err) {
        console.error("Failed to process payment event:", err.message);
      }
    },
  );
};
