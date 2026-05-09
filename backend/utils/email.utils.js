const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"MultiVendor Store" <${process.env.EMAIL_FROM}>`,
      to, subject, html,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to MultiVendor Store!',
    html: `<h2>Hi ${name},</h2><p>Welcome to MultiVendor Store! Your account has been created successfully.</p>`
  }),
  passwordReset: (name, token) => ({
    subject: 'Password Reset Request',
    html: `<h2>Hi ${name},</h2><p>Click the link below to reset your password (valid for 1 hour):</p>
           <a href="${process.env.CLIENT_URL}/reset-password?token=${token}">Reset Password</a>`
  }),
  orderPlaced: (orderNumber, total) => ({
    subject: `Order Confirmed - ${orderNumber}`,
    html: `<h2>Order Confirmed!</h2><p>Your order <strong>${orderNumber}</strong> has been placed successfully.</p>
           <p>Total: ₹${total}</p>`
  }),
  vendorApproved: (storeName) => ({
    subject: 'Your Vendor Account is Approved!',
    html: `<h2>Congratulations!</h2><p>Your vendor store <strong>${storeName}</strong> has been approved. You can now start selling!</p>`
  }),
  vendorRejected: (storeName, note) => ({
    subject: 'Vendor Application Update',
    html: `<h2>Application Update</h2><p>Your vendor application for <strong>${storeName}</strong> has been reviewed.</p>
           <p>Reason: ${note}</p>`
  }),
};

module.exports = { sendEmail, emailTemplates };
