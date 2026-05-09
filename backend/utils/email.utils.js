const nodemailer = require('nodemailer');

const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
const emailPort = Number(process.env.EMAIL_PORT) || 587;
const emailSecure = emailPort === 465;

const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailSecure,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { rejectUnauthorized: false },
});

transporter.verify().then(() => {
  console.log(`✅ Email transporter ready: ${emailHost}:${emailPort}`);
}).catch((err) => {
  console.error('❌ Email transporter verify failed:', err.message);
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
  passwordReset: (name, token, role = 'user') => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return {
      subject: 'Password Reset Request',
      html: `<h2>Hi ${name},</h2><p>Click the link below to reset your password (valid for 1 hour):</p>
             <a href="${clientUrl}/reset-password?token=${token}&role=${role}">Reset Password</a>`
    };
  },
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
