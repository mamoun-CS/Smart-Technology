const nodemailer = require('nodemailer');
const dns = require('dns');
const net = require('net');
require('dotenv').config();

// Diagnostic: Check DNS resolution and network connectivity
const checkEmailConnectivity = async () => {
  console.log('\n=== EMAIL CONNECTIVITY DIAGNOSTICS ===');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'NOT SET');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set (length: ' + process.env.EMAIL_PASS.length + ')' : 'NOT SET');
  
  // Test DNS resolution
  dns.resolve('smtp.gmail.com', (err, addresses) => {
    if (err) {
      console.error('❌ DNS Resolution FAILED:', err.message);
    } else {
      console.log('✅ DNS Resolution SUCCESS:', addresses);
    }
  });
  
  // Test port 587 connectivity
  const testPort587 = new net.Socket();
  testPort587.setTimeout(5000);
  testPort587.on('connect', () => {
    console.log('✅ Port 587 connectivity: SUCCESS');
    testPort587.destroy();
  });
  testPort587.on('timeout', () => {
    console.error('❌ Port 587 connectivity: TIMEOUT (5s)');
    testPort587.destroy();
  });
  testPort587.on('error', (err) => {
    console.error('❌ Port 587 connectivity: ERROR -', err.message);
  });
  testPort587.connect(587, 'smtp.gmail.com');
  
  // Test port 465 connectivity (alternative SSL port)
  const testPort465 = new net.Socket();
  testPort465.setTimeout(5000);
  testPort465.on('connect', () => {
    console.log('✅ Port 465 connectivity: SUCCESS');
    testPort465.destroy();
  });
  testPort465.on('timeout', () => {
    console.error('❌ Port 465 connectivity: TIMEOUT (5s)');
    testPort465.destroy();
  });
  testPort465.on('error', (err) => {
    console.error('❌ Port 465 connectivity: ERROR -', err.message);
  });
  testPort465.connect(465, 'smtp.gmail.com');
  
  console.log('=== END DIAGNOSTICS ===\n');
};

// Run diagnostics on startup
checkEmailConnectivity();

// Configure SMTP transporter for Gmail (initially using port 587)
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// Verify connection on startup with fallback to port 465
const verifyEmailConnection = async () => {
  console.log('\n=== VERIFYING EMAIL CONNECTION ===');
  
  // Try port 587 first
  try {
    await transporter.verify();
    console.log('✅ Email server is ready (Port 587)');
    return;
  } catch (error) {
    console.error('❌ Port 587 failed:', error.message);
    console.log('🔄 Attempting fallback to port 465 (SSL)...');
  }
  
  // Fallback to port 465 (SSL)
  const transporterSSL = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });
  
  try {
    await transporterSSL.verify();
    console.log('✅ Email server is ready (Port 465 SSL)');
    // Update the main transporter to use SSL
    transporter = transporterSSL;
  } catch (sslError) {
    console.error('❌ Port 465 also failed:', sslError.message);
    console.error('\n⚠️  EMAIL WILL NOT WORK! Possible causes:');
    console.error('   1. Network/firewall blocking SMTP ports (587, 465)');
    console.error('   2. DNS cannot resolve smtp.gmail.com');
    console.error('   3. No internet connectivity');
    console.error('   4. Gmail security settings blocking connection');
    console.error('\n💡 RECOMMENDATION: Check network connectivity and firewall rules');
  }
};

verifyEmailConnection();

// Wrap sendMail to handle errors gracefully
const safeSendMail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    console.error('Email error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
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
            <p>This link will expire in 24 hours.</p>
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
            <p>This link will expire in 24 hours.</p>
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
