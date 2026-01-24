const rabbitmq = require("../utils/rabbitMQ");
const businessRepo = require("../repositories/business.repository");

const BUSINESS_EXCHANGE = process.env.BUSINESS_EXCHANGE;

exports.setupBusinessListeners = () => {
  rabbitmq.consume(
    BUSINESS_EXCHANGE,
    process.env.BUSINESS_RPC_QUEUE,
    "business.validation.request",
    async (data) => {
      const { businessId, correlationId } = data;

      try {
        const business = await businessRepo.findById(businessId);

        const response = {
          valid: !!business && business.businessStatus === "Approved",
          status: business ? business.businessStatus : "NotFound",
        };

        await rabbitmq.publish(
          BUSINESS_EXCHANGE,
          `business.validation.response.${correlationId}`,
          response,
        );
      } catch (err) {
        console.error("Business validation failed:", err.message);

        await rabbitmq.publish(
          BUSINESS_EXCHANGE,
          `business.validation.response.${correlationId}`,
          {
            valid: false,
            status: "Error",
          },
        );
      }
    },
  );

  rabbitmq.consume(
    BUSINESS_EXCHANGE,
    process.env.BUSINESS_APPROVAL_QUEUE,
    "business.approve.request",
    async (data) => {
      const { businessId } = data;

      try {
        await businessRepo.updateStatus(businessId, "Approved");

        await rabbitmq.publish(BUSINESS_EXCHANGE, "business.approved", {
          businessId,
        });

        console.log(`Business approved: ${businessId}`);
      } catch (err) {
        console.error("Business approval failed:", err.message);
      }
    },
  );
};
