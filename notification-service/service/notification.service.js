const notificationRepo = require("../repositories/notification.repository");

class NotificationService {
  async createInAppNotification(userId, title, message, type) {
    return await notificationRepo.create({
      userId,
      type: type,
      subject: title,
      message: message,
      status: "unread",
      createdAt: new Date(),
    });
  }

  async notifyAdoptionApproved(userId, petName) {
    const title = "Adoption Approved! 🎉";
    const message = `Great news! Your adoption request for ${petName} has been approved. Please proceed to payment to finalize the process.`;
    return this.createInAppNotification(userId, title, message, "ADOPTION");
  }

  async notifyAdoptionRejected(userId, petName, reason) {
    const title = "Adoption Update";
    const message = `Your request for ${petName} was not approved this time. Reason: ${reason}`;
    return this.createInAppNotification(userId, title, message, "ADOPTION");
  }

  async notifyPaymentSuccess(userId, amount) {
    const title = "Payment Successful";
    const message = `We've received your payment of Rs. ${amount}. Thank you for choosing adoption!`;
    return this.createInAppNotification(userId, title, message, "PAYMENT");
  }

  async notifyBusinessPayment(businessId, amount, petName) {
    const title = "New Adoption Payment";
    const message = `You have received a payment of Rs. ${amount} for ${petName}.`;
    return this.createInAppNotification(businessId, title, message, "PAYMENT");
  }
}

module.exports = new NotificationService();
