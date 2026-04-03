require('dotenv').config();
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const GMAIL_SENDER_EMAIL = process.env.GMAIL_SENDER_EMAIL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

let oauth2Client = null;
let gmailService = null;

function getGmailService() {
    if (gmailService) return gmailService;

    oauth2Client = new OAuth2(
        GMAIL_CLIENT_ID,
        GMAIL_CLIENT_SECRET,
        'http://localhost'
    );

    oauth2Client.setCredentials({
        refresh_token: GMAIL_REFRESH_TOKEN
    });

    gmailService = google.gmail({ version: 'v1', auth: oauth2Client });
    return gmailService;
}

async function sendEmail({ to, subject, html }) {
    const gmail = getGmailService();

    const email = [
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${subject}`,
        '',
        html
    ].join('\n');

    const encodedEmail = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedEmail }
    });

    console.log('Email sent successfully:', { to, subject, messageId: response.data.id });
    return { success: true, data: response.data };
}

const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000'}/verify-email/${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(to right, #7f1d1d, #dc2626, #f97316); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Smart Technology</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e5e5;">
        <h2>Hello ${name},</h2>
        <p>Thank you for registering with Smart Technology. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      </div>
      <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Smart Technology. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify your Smart Technology account',
    html,
  });
};

const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000'}/reset-password/${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(to right, #7f1d1d, #dc2626, #f97316); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Smart Technology</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e5e5;">
        <h2>Hello ${name},</h2>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
      </div>
      <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Smart Technology. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset your Smart Technology password',
    html,
  });
};

const sendOrderConfirmationEmail = async (email, name, order, locale = 'en') => {
  const currencyLabel = locale === 'ar' ? 'شيكل' : 'ILS';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(to right, #7f1d1d, #dc2626, #f97316); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Smart Technology</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e5e5;">
        <h2>Order Confirmed!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for your order. Your order has been received and is being processed.</p>
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Total:</strong> ${order.total_price} ${currencyLabel}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>
        <p>We'll notify you when your order is shipped.</p>
      </div>
      <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Smart Technology. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Order Confirmation #${order.id}`,
    html,
  });
};

const sendContactFormEmail = async (name, email, message) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(to right, #7f1d1d, #dc2626, #f97316); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Smart Technology</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e5e5;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; margin: 10px 0;">
          ${message}
        </div>
      </div>
      <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Smart Technology. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: ADMIN_EMAIL || 'admin@smarttech.com',
    subject: `Contact Form: Message from ${name}`,
    html,
  });
};

const sendAdminNotification = async (subject, message) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(to right, #7f1d1d, #dc2626, #f97316); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Smart Technology</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e5e5;">
        <h2>Admin Notification</h2>
        <div style="background: #f5f5f5; padding: 15px; margin: 10px 0;">
          ${message}
        </div>
      </div>
      <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} Smart Technology. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: ADMIN_EMAIL || 'admin@smarttech.com',
    subject,
    html,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendContactFormEmail,
  sendAdminNotification,
};
