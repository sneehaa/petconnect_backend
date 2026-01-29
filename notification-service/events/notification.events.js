const rabbitmq = require("../utils/rabbitMQ");
const notificationService = require("../service/notification.service");

const ADOPTION_EXCHANGE = process.env.ADOPTION_EXCHANGE;
const PAYMENT_EXCHANGE = process.env.PAYMENT_EXCHANGE;
const NOTIFICATION_EXCHANGE = process.env.NOTIFICATION_EXCHANGE;

exports.setupEventListeners = () => {
  // CORRECT: Listen for NEW applications from NOTIFICATION_EXCHANGE
  rabbitmq.consume(
    process.env.NOTIFICATION_EXCHANGE, // Fixed: use correct exchange
    process.env.NOTIFICATION_ADOPTION_QUEUE,
    "adoption.new_application",
    async (data) => {
      try {
        console.log("Received adoption.new_application event:", data);
        // Business gets "You have a new adoption request"
        await notificationService.notifyNewAdoptionRequest(
          data.businessId,
          data.userName,
          data.petName,
        );
      } catch (err) {
        console.error("New adoption request notification failed:", err.message);
      }
    },
  );

  // CORRECT: Listen for APPROVALS from ADOPTION_EXCHANGE
  rabbitmq.consume(
    process.env.ADOPTION_EXCHANGE,
    process.env.NOTIFICATION_ADOPTION_QUEUE,
    "adoption.approved",
    async (data) => {
      try {
        console.log("Received adoption.approved event:", data);
        // USER gets "Your adoption is approved"
        await notificationService.notifyAdoptionApproved(
          data.userId,
          data.petName,
        );
      } catch (err) {
        console.error("Adoption approval notification failed:", err.message);
      }
    },
  );

  // Add the same for REJECTED events
  rabbitmq.consume(
    process.env.ADOPTION_EXCHANGE,
    process.env.NOTIFICATION_ADOPTION_QUEUE,
    "adoption.rejected",
    async (data) => {
      try {
        console.log("Received adoption.rejected event:", data);
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
    process.env.PAYMENT_EXCHANGE,
    process.env.NOTIFICATION_PAYMENT_QUEUE,
    "payment.completed",
    async (data) => {
      try {
        console.log("Received payment.completed event:", data);
        await notificationService.notifyPaymentSuccess(
          data.userId,
          data.amount,
        );
        await notificationService.notifyBusinessPayment(
          data.businessId,
          data.amount,
          data.petName,
        );
      } catch (err) {
        console.error("Payment notification failed:", err.message);
      }
    },
  );
};
