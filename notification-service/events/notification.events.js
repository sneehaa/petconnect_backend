const rabbitmq = require("../utils/rabbitMQ");
const notificationService = require("../service/notification.service");

const ADOPTION_EXCHANGE = process.env.ADOPTION_EXCHANGE;
const PAYMENT_EXCHANGE = process.env.PAYMENT_EXCHANGE;

exports.setupEventListeners = () => {
  rabbitmq.consume(
    ADOPTION_EXCHANGE,
    process.env.NOTIFICATION_ADOPTION_QUEUE,
    "adoption.approved",
    async (data) => {
      try {
        await notificationService.notifyAdoptionApproved(
          data.userId,
          data.petName,
        );
      } catch (err) {
        console.error("Adoption approval notification failed:", err.message);
      }
    },
  );

  rabbitmq.consume(
    ADOPTION_EXCHANGE,
    process.env.NOTIFICATION_ADOPTION_QUEUE,
    "adoption.rejected",
    async (data) => {
      try {
        await notificationService.notifyAdoptionRejected(
          data.userId,
          data.petName,
          data.reason,
        );
      } catch (err) {
        console.error("Adoption rejection notification failed:", err.message);
      }
    },
  );

  rabbitmq.consume(
    PAYMENT_EXCHANGE,
    process.env.NOTIFICATION_PAYMENT_QUEUE,
    "payment.completed",
    async (data) => {
      try {
        await notificationService.notifyPaymentSuccess(
          data.userId,
          data.amount,
        );
        if (data.businessId) {
          await notificationService.notifyBusinessPayment(
            data.businessId,
            data.amount,
            data.petName,
          );
        }
      } catch (err) {
        console.error("Payment notification failed:", err.message);
      }
    },
  );
};
