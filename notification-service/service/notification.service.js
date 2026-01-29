const notificationRepo = require("../repositories/notification.repository");

class NotificationService {
  async createInAppNotification(userId, businessId, title, message) {
    return await notificationRepo.create({
      userId: userId || null,
      businessId: businessId || null,
      type: "in_app",
      subject: title,
      message: message,
      status: "pending",
      createdAt: new Date(),
    });
  }

  async notifyNewAdoptionRequest(businessId, userName, petName) {
    const title = "New Adoption Request 🐾";
    const message = `${userName} has applied to adopt ${petName}. Please review their application.`;
    console.log(`Creating business notification for ${businessId}: ${message}`);
    return this.createInAppNotification(null, businessId, title, message);
  }

  async notifyAdoptionApproved(userId, petName) {
    const title = "Adoption Approved! 🎉";
    const message = `Great news! Your adoption request for ${petName} has been approved. Please proceed to payment to finalize the process.`;
    console.log(
      `Creating user approval notification for ${userId}: ${message}`,
    );
    return this.createInAppNotification(userId, null, title, message);
  }

  async notifyAdoptionRejected(userId, petName, reason) {
    const title = "Adoption Update";
    const message = `Your request for ${petName} was not approved this time. Reason: ${reason || "No reason provided"}`;
    console.log(
      `Creating user rejection notification for ${userId}: ${message}`,
    );
    return this.createInAppNotification(userId, null, title, message);
  }

  async notifyPaymentSuccess(userId, amount) {
    const title = "Payment Successful";
    const message = `We've received your payment of Rs. ${amount}. Thank you for choosing adoption!`;
    return this.createInAppNotification(userId, null, title, message);
  }

  async notifyBusinessPayment(businessId, amount, petName) {
    const title = "New Adoption Payment";
    const message = `You have received a payment of Rs. ${amount} for ${petName}.`;
    console.log(
      `Creating business payment notification for ${businessId}: ${message}`,
    );
    return this.createInAppNotification(null, businessId, title, message);
  }

  async handleAdoptionNotifications(data) {
    try {
      console.log("Handling adoption notification:", data);

      switch (data.eventType) {
        case "new_application":
          await this.notifyNewAdoptionRequest(
            data.businessId,
            data.userName,
            data.petName,
          );
          console.log("Business notification created for new application");
          break;

        case "application_approved":
          await this.notifyAdoptionApproved(data.userId, data.petName);
          console.log("User notification created for approval");
          break;

        case "application_rejected":
          await this.notifyAdoptionRejected(
            data.userId,
            data.petName,
            data.reason,
          );
          console.log("User notification created for rejection");
          break;

        default:
          console.log("Unknown notification type:", data.eventType);
      }
    } catch (error) {
      console.error("Error handling adoption notification:", error);
    }
  }
}

module.exports = new NotificationService();
