const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sendEmail } = require('../services/emailService');

(async () => {
  try {
    const result = await sendEmail({
      to: 'mamounkhanfa5@gmail.com',
      subject: 'Test Email - Smart Technology',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #7f1d1d, #dc2626, #f97316); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Smart Technology</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e5e5;">
            <h2>Test Email</h2>
            <p>This is a test email to verify Gmail API integration is working correctly.</p>
            <p>Sent at: ${new Date().toISOString()}</p>
          </div>
        </div>
      `,
    });
    console.log('Email sent successfully:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Failed to send email:', error.message);
  }
})();
