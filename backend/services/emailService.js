const { google } = require('googleapis');

// ---------------------------------------------------------------------------
// Gmail API OAuth2 Setup
// ---------------------------------------------------------------------------
// To obtain the credentials below, follow these steps:
//
// 1. Go to https://console.cloud.google.com/ → create (or select) a project.
// 2. Enable the **Gmail API** for that project.
// 3. Navigate to **APIs & Services → Credentials** and create an **OAuth 2.0
//    Client ID** (type: "Web application").
//    - Copy the Client ID  → GMAIL_CLIENT_ID
//    - Copy the Client Secret → GMAIL_CLIENT_SECRET
//    - Add http://localhost as an authorised redirect URI → GMAIL_REDIRECT_URI
//
// 4. Generate a refresh token:
//    - Use the OAuth 2.0 Playground (https://developers.google.com/oauthplayground/)
//      or a local script that performs the 3-legged OAuth flow.
//    - Authorise scope: https://mail.google.com/
//    - Exchange the authorisation code for tokens.
//    - Copy the refresh_token → GMAIL_REFRESH_TOKEN
//
// 5. Set GMAIL_SENDER_EMAIL to the Gmail address you authorised with.
// ---------------------------------------------------------------------------

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const SENDER_EMAIL = process.env.GMAIL_SENDER_EMAIL;

/**
 * Create and return an authenticated Gmail API client.
 * The OAuth2 client uses a long-lived refresh token so the service
 * can obtain fresh access tokens on every request without user interaction.
 *
 * @returns {import('googleapis').gmail_v1.Gmail}
 */
function getGmailClient() {
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Build a MIME message and encode it in base64url format required by the
 * Gmail API `users.messages.send` endpoint.
 *
 * @param {Object} options
 * @param {string} options.from   - Sender email address
 * @param {string} options.to     - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html   - HTML body
 * @returns {string} base64url-encoded raw message
 */
function buildRawMessage({ from, to, subject, html }) {
  const mimeMessage = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(html, 'utf-8').toString('base64'),
  ].join('\r\n');

  // Gmail API requires base64url encoding (RFC 4648 §5)
  return Buffer.from(mimeMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send an email via the Gmail API using OAuth2 authentication.
 *
 * @param {Object} options
 * @param {string} options.to      - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html    - HTML content of the email
 * @returns {Promise<Object>}      - Gmail API response data
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const gmail = getGmailClient();
    const raw = buildRawMessage({
      from: SENDER_EMAIL,
      to,
      subject,
      html,
    });

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });

    console.log('Email sent successfully:', { to, subject, messageId: response.data.id });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Email sending FAILED:', {
      to,
      subject,
      error: error.message,
      code: error.code,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send account verification email.
 *
 * @param {string} email - Recipient email
 * @param {string} name  - User's name
 * @param {string} token - Verification token
 * @returns {Promise<Object>}
 */
const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;

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

/**
 * Send password reset email.
 *
 * @param {string} email - Recipient email
 * @param {string} name  - User's name
 * @param {string} token - Password reset token
 * @returns {Promise<Object>}
 */
const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;

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

/**
 * Send order confirmation email.
 *
 * @param {string} email  - Recipient email
 * @param {string} name   - User's name
 * @param {Object} order  - Order details
 * @param {string} locale - Language code ('ar' | 'en')
 * @returns {Promise<Object>}
 */
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

/**
 * Send contact form email to the admin.
 *
 * @param {string} name    - Sender's name
 * @param {string} email   - Sender's email
 * @param {string} message - Contact message
 * @returns {Promise<Object>}
 */
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
    to: process.env.ADMIN_EMAIL || 'admin@smarttech.com',
    subject: `Contact Form: Message from ${name}`,
    html,
  });
};

/**
 * Send admin notification email.
 *
 * @param {string} subject - Email subject
 * @param {string} message - Notification message (HTML)
 * @returns {Promise<Object>}
 */
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
    to: process.env.ADMIN_EMAIL || 'admin@smarttech.com',
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
