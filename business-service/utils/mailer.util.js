const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendMail = (to, subject, otp) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Alice&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          padding: 40px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          font-family: 'Alice', serif;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #f8f8f8;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 24px;
        }
        .content {
          font-size: 16px;
          color: #333333;
          line-height: 1.6;
        }
        .otp-box {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background-color: #f9f9f9;
          border: 1px dashed #00466a;
          border-radius: 4px;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          color: #00466a;
          letter-spacing: 5px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eeeeee;
          font-size: 12px;
          color: #777777;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Identity Verification</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to verify your email address. Please use the following One-Time Password (OTP) to proceed. This code is valid for 10 minutes.</p>
          
          <div class="otp-box">
            <span class="otp-code">${otp}</span>
          </div>
          
          <p>If you did not initiate this request, please ignore this email or contact our support team.</p>
          <p>Best regards,<br>The Support Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 PetConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"App Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  });
};
