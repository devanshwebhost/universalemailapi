const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmails({ name, email, message, attachments }) {
  // ✅ Admin email
  try {
    await transporter.sendMail({
      from: `"Form Bot" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      attachments,
      replyTo: email, // ✅ allow admin to reply to user's email
    });
    console.log("✅ Admin email sent");
  } catch (err) {
    console.error("❌ Failed to send email to admin:", err);
  }

  // ✅ Thank you email to user
  try {
    console.log("📧 Sending thank-you email to user:", email);

    await transporter.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Thanks ${name}, we got your message!`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h3>Hi ${name},</h3>
          <p>Thank you for reaching out to us.</p>
          <p>We received your message:</p>
          <blockquote style="background:#f1f1f1; padding:10px; border-left:4px solid #0c52a2;">
            ${message}
          </blockquote>
          <p>We'll get back to you shortly.</p>
          <p>Best regards,<br/>Support Team</p>
        </div>
      `,
    });
    console.log("✅ Thank-you email sent to user");
  } catch (err) {
    console.error("❌ Failed to send thank-you email to user:", err);
  }
}

module.exports = sendEmails;
