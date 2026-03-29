const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure SMTP transporter for Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.warn('Email connection failed:', error.message);
  } else {
    console.log('Email server is ready');
  }
});

// Wrap sendMail to handle errors gracefully
const safeSendMail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.warn('Email sending failed:', error.message);
    return false;
  }
};

const emailUtils = {
  // Generic send email function
  async sendEmail({ to, subject, html }) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@smarttech.com',
      to,
      subject,
      html
    };

    return safeSendMail(mailOptions);
  },

  // Send verification email
  async sendVerificationEmail(email, name, token) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@smarttech.com',
      to: email,
      subject: 'Verify your Smart Technology account',
      html: `
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
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>&copy; ${new Date().getFullYear()} Smart Technology. All rights reserved.</p>
          </div>
        </div>
      `
    };

    return safeSendMail(mailOptions);
  },

  // Send password reset email
  async sendPasswordResetEmail(email, name, token) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@smarttech.com',
      to: email,
      subject: 'Reset your Smart Technology password',
      html: `
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
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>&copy; ${new Date().getFullYear()} Smart Technology. All rights reserved.</p>
          </div>
        </div>
      `
    };

    return safeSendMail(mailOptions);
  },

  // Send order confirmation email
  async sendOrderConfirmationEmail(email, name, order) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@smarttech.com',
      to: email,
      subject: `Order Confirmation #${order.id}`,
      html: `
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
      `
    };

    return safeSendMail(mailOptions);
  }
};

module.exports = emailUtils;
