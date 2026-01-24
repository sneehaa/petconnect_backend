const rabbitmq = require("../utils/rabbitmq");
const paymentService = require("../services/payment.service");
const walletService = require("../services/wallet.service");

exports.setupEventListeners = () => {
  // Listen for Adoption Approvals to initiate payment
  rabbitmq.consume(
    process.env.ADOPTION_EXCHANGE,
    process.env.ADOPTION_APPROVED_PAYMENTS_QUEUE,
    "adoption.approved",
    async (data) => {
      const { adoptionId, userId, businessId, petId, adoptionFee } = data;
      console.log(`[Payment Listener] Adoption approved: ${adoptionId}`);

      try {
        await paymentService.initiatePayment({
          userId,
          businessId,
          adoptionId,
          petId,
          amount: adoptionFee || 0, // Fallback if adoptionFee is missing
        });
      } catch (err) {
        console.error(`[Payment Listener] Initiation failed:`, err.message);
        await rabbitmq.publish(
          process.env.PAYMENT_EXCHANGE,
          "payment.initiation.failed",
          {
            adoptionId,
            userId,
            reason: err.message,
          },
        );
      }
    },
  );

  // Corrected the double "process.env.process.env" error here
  rabbitmq.consume(
    process.env.PAYMENT_EXCHANGE,
    process.env.PAYMENT_HOLD_REQUEST_QUEUE,
    "payment.hold.request",
    async (data) => {
      const { userId, adoptionId, amount } = data;
      try {
        await walletService.holdMoneyForAdoption(userId, adoptionId, amount);
      } catch (err) {
        console.error(`[Payment Listener] Hold failed:`, err.message);
        await rabbitmq.publish(
          process.env.PAYMENT_EXCHANGE,
          "payment.hold.failed",
          {
            adoptionId,
            userId,
            reason: err.message,
          },
        );
      }
    },
  );

  // Release Hold
  rabbitmq.consume(
    process.env.PAYMENT_EXCHANGE,
    process.env.PAYMENT_RELEASE_REQUEST_QUEUE,
    "payment.release.request",
    async (data) => {
      const { userId, adoptionId } = data;
      try {
        await walletService.releaseHold(userId, adoptionId);
      } catch (err) {
        console.error(`[Payment Listener] Release failed:`, err.message);
      }
    },
  );

  // Process Payment
  rabbitmq.consume(
    process.env.PAYMENT_EXCHANGE,
    process.env.PAYMENT_PROCESSING_QUEUE,
    "payment.process.request",
    async (data) => {
      const { paymentId, paymentMethod } = data;
      try {
        await paymentService.processPayment(paymentId, paymentMethod);
      } catch (err) {
        console.error(`[Payment Listener] Processing failed:`, err.message);
      }
    },
  );
};
