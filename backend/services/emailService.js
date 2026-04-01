const { Resend } = require('resend');

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

// NOTE: For production use, you need to:
// 1. Verify a domain at resend.com/domains
// 2. Update the 'from' address below to use your verified domain
// 3. Example: from: 'noreply@yourdomain.com'
// 
// For testing, you can only send to your own email address.
// The default 'onboarding@resend.dev' only works for testing purposes.

/**
 * Generic email sending function using Resend API
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @returns {Promise<Object>} - Resend API response
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Email sending FAILED:', error);
      
      // Provide helpful error message for common Resend API issues
      if (error.statusCode === 403 && error.message.includes('testing emails')) {
        throw new Error(
          `Resend API Error: You can only send testing emails to your own email address. ` +
          `To send emails to other recipients, please:
` +
          `1. Verify a domain at resend.com/domains
` +
          `2. Update the 'from' address in emailService.js to use your verified domain
` +
          `3. Or use a Resend API key with a verified domain`
        );
      }
      
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('✅ Email sent SUCCESSFULLY:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Email sending FAILED:', error.message);
    throw error;
  }
};

/**
 * Send account verification email
 * @param {string} email - Recipient email
 * @param {string} name - User's name
 * @param {string} token - Verification token
 * @returns {Promise<Object>} - Email sending result
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
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} name - User's name
 * @param {string} token - Password reset token
 * @returns {Promise<Object>} - Email sending result
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
 * Send order confirmation email
 * @param {string} email - Recipient email
 * @param {string} name - User's name
 * @param {Object} order - Order details
 * @returns {Promise<Object>} - Email sending result
 */
const sendOrderConfirmationEmail = async (email, name, order) => {
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
          <p><strong>Total:</strong> $${order.total_price}</p>
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
 * Send contact form email
 * @param {string} name - Sender's name
 * @param {string} email - Sender's email
 * @param {string} message - Contact message
 * @returns {Promise<Object>} - Email sending result
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
 * Send admin notification email
 * @param {string} subject - Email subject
 * @param {string} message - Notification message
 * @returns {Promise<Object>} - Email sending result
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
