const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendMail = (to, subject, text) => {
  return transporter.sendMail({
    from: '"App Support" <no-reply@app.com>',
    to,
    subject,
    text,
  });
};
