const rabbitmq = require("../utils/rabbitmq");
const paymentService = require("../services/payment.service");
const walletService = require("../services/wallet.service");

exports.setupEventListeners = () => {
  rabbitmq.consume(
    process.env.ADOPTION_EXCHANGE,
    process.env.ADOPTION_APPROVED_PAYMENTS_QUEUE,
    "adoption.approved",
    async (data) => {
      const {
        adoptionId,
        userId,
        businessId,
        petId,
        adoptionFee,
        userName,
        userPhone,
        petName,
      } = data;
      console.log(`[Payment Listener] Adoption approved: ${adoptionId}`);

      try {
        await paymentService.createPaymentDirect({
          userId,
          businessId,
          adoptionId,
          petId,
          amount: adoptionFee || 0,
          userName,
          userPhone,
          petName,
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

  rabbitmq.consume(
    process.env.PAYMENT_EXCHANGE,
    process.env.PAYMENT_PROCESSING_QUEUE,
    "payment.process.request",
    async (data) => {
      const { paymentId, paymentMethod } = data;
      try {
        await paymentService.processPaymentDirect(paymentId, paymentMethod);
      } catch (err) {
        console.error(`[Payment Listener] Processing failed:`, err.message);
      }
    },
  );
};
