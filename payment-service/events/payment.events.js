const rabbitmq = require("../utils/rabbitmq");
const paymentService = require("../services/payment.service");
const walletService = require("../services/wallet.service");

const ADOPTION_EXCHANGE = "adoption_events_exchange";
const PAYMENT_EXCHANGE = "payment_events_exchange";

exports.setupEventListeners = () => {
  rabbitmq.consume(
    ADOPTION_EXCHANGE,
    "adoption_approved_payments_queue",
    "adoption.approved",
    async (data) => {
      const { adoptionId, userId, businessId, petId, adoptionFee } = data;

      console.log(`[Payment Listener] Adoption approved: ${adoptionId}`);

      try {
        // Create payment record for approved adoption
        await paymentService.initiatePayment({
          userId,
          businessId,
          adoptionId,
          petId,
          amount: adoptionFee,
        });

        console.log(
          `[Payment Listener] Payment initiated for adoption ${adoptionId}`,
        );
      } catch (err) {
        console.error(
          `[Payment Listener] Failed to initiate payment for adoption ${adoptionId}:`,
          err.message,
        );

        await rabbitmq.publish(PAYMENT_EXCHANGE, "payment.initiation.failed", {
          adoptionId,
          userId,
          businessId,
          reason: err.message,
        });
      }
    },
  );

  // Listen for payment hold requests
  rabbitmq.consume(
    PAYMENT_EXCHANGE,
    "payment_hold_request_queue",
    "payment.hold.request",
    async (data) => {
      const { userId, adoptionId, amount } = data;

      try {
        await walletService.holdMoneyForAdoption(userId, adoptionId, amount);

        console.log(
          `[Payment Listener] Hold placed for adoption ${adoptionId}`,
        );
      } catch (err) {
        console.error(
          `[Payment Listener] Hold failed for adoption ${adoptionId}:`,
          err.message,
        );

        await rabbitmq.publish(PAYMENT_EXCHANGE, "payment.hold.failed", {
          adoptionId,
          userId,
          reason: err.message,
        });
      }
    },
  );

  // Listen for payment release requests
  rabbitmq.consume(
    PAYMENT_EXCHANGE,
    "payment_release_request_queue",
    "payment.release.request",
    async (data) => {
      const { userId, adoptionId } = data;

      try {
        await walletService.releaseHold(userId, adoptionId);

        console.log(
          `[Payment Listener] Hold released for adoption ${adoptionId}`,
        );
      } catch (err) {
        console.error(
          `[Payment Listener] Release failed for adoption ${adoptionId}:`,
          err.message,
        );
      }
    },
  );

  // Listen for payment processing requests
  rabbitmq.consume(
    PAYMENT_EXCHANGE,
    "payment_processing_queue",
    "payment.process.request",
    async (data) => {
      const { paymentId, paymentMethod } = data;

      try {
        await paymentService.processPayment(paymentId, paymentMethod);

        console.log(`[Payment Listener] Payment processed: ${paymentId}`);
      } catch (err) {
        console.error(
          `[Payment Listener] Payment processing failed: ${paymentId}`,
          err.message,
        );
      }
    },
  );

  // Listen for user notifications
  rabbitmq.consume(
    PAYMENT_EXCHANGE,
    "payment_notifications_queue",
    "payment.*",
    async (data, routingKey) => {
      const eventType = routingKey.split(".")[1];

      switch (eventType) {
        case "completed":
          console.log(
            `[Payment Listener] Sending notification: Payment completed for ${data.adoptionId}`,
          );
          break;

        case "failed":
          console.log(
            `[Payment Listener] Sending notification: Payment failed for ${data.adoptionId}`,
          );
          break;

        case "initiated":
          console.log(
            `[Payment Listener] Payment initiated for ${data.adoptionId}`,
          );
          break;
      }
    },
  );
};
