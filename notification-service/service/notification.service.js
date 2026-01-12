const nodemailer = require("nodemailer");
const notificationRepo = require("../repositories/notification.repository");

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, text) {
    const notification = await notificationRepo.create({
      type: "email",
      subject,
      message: text,
      status: "pending"
    });

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
      };

      await this.transporter.sendMail(mailOptions);
      
      await notificationRepo.updateStatus(notification._id, "sent");
      return { success: true, notificationId: notification._id };
    } catch (error) {
      await notificationRepo.updateStatus(notification._id, "failed");
      throw new Error(`Email failed: ${error.message}`);
    }
  }

  async notifyAdoptionApproved(userEmail, petName) {
    const subject = "Adoption Approved!";
    const text = `Your adoption request for ${petName} has been approved. Please proceed to payment.`;
    
    return this.sendEmail(userEmail, subject, text);
  }

  async notifyAdoptionRejected(userEmail, petName, reason) {
    const subject = "Adoption Status Update";
    const text = `Your adoption request for ${petName} was rejected. Reason: ${reason}`;
    
    return this.sendEmail(userEmail, subject, text);
  }

  async notifyPaymentSuccess(userEmail, amount) {
    const subject = "Payment Successful!";
    const text = `Your payment of Rs. ${amount} was successful.`;
    
    return this.sendEmail(userEmail, subject, text);
  }

  async notifyBusinessPayment(businessEmail, amount, petName) {
    const subject = "New Payment Received";
    const text = `You received Rs. ${amount} for ${petName} adoption.`;
    
    return this.sendEmail(businessEmail, subject, text);
  }
}

module.exports = new NotificationService();