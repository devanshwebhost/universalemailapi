const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmails({ name, email, message, attachments }) {
  // Admin mail
  await transporter.sendMail({
    from: `"Form Bot" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Form Submission from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    attachments,
  });

  // Confirmation to user
  await transporter.sendMail({
    from: `"Support Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Thanks ${name}, we got your message!`,
    text: `Hi ${name},\n\nWe received your message:\n"${message}"\n\nWe will get back to you shortly.`,
    attachments,
  });
}

module.exports = sendEmails;
