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
        .email-body {
          font-family: 'Alice', serif;
          line-height: 1.6;
          color: #333;
        }
      </style>
    </head>
    <body class="email-body">
      <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #000; margin: 0; font-size: 28px;">Verification Required</h1>
        </div>
        
        <p style="font-size: 18px;">Hello,</p>
        <p style="font-size: 16px;">Thank you for joining us. To complete your registration, please use the verification code below. This code will expire in 10 minutes.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #f8f8f8; border: 1px dashed #ccc; padding: 15px 30px; font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #000; border-radius: 4px;">
            ${otp}
          </span>
        </div>
        
        <p style="font-size: 14px; color: #666;">If you did not request this code, please ignore this email or contact support if you have concerns.</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 14px; color: #999; text-align: center;">
          <p>© 2026 Your App Name. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: '"App Support" <no-reply@app.com>',
    to,
    subject,
    html: htmlContent,
  });
};
