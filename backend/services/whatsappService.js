const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.whatsappApiUrl = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/v1';
    this.whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.whatsappAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.isConfigured = !!(this.whatsappPhoneNumberId && this.whatsappAccessToken);
  }

  async sendOTP(phoneNumber, countryCode, otpCode) {
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    
    const message = `Your verification code is: ${otpCode}\n\nThis code will expire in 5 minutes.\n\nDo not share this code with anyone.`;

    if (!this.isConfigured) {
      console.log(`[WhatsApp Mock] Would send to ${fullPhoneNumber}: ${message}`);
      return {
        success: true,
        mock: true,
        message: 'WhatsApp not configured - OTP logged for testing',
        phone: this.maskPhoneNumber(fullPhoneNumber)
      };
    }

    try {
      const response = await axios.post(
        `${this.whatsappApiUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to: fullPhoneNumber,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.whatsappAccessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data?.messages?.[0]?.id,
        phone: this.maskPhoneNumber(fullPhoneNumber)
      };
    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      throw new Error('Failed to send WhatsApp message');
    }
  }

  async sendWelcomeMessage(phoneNumber, countryCode, name) {
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    
    const message = `Welcome to Smart Technology, ${name}! 🎉\n\nYour account has been successfully created.\n\nStart shopping at our store and enjoy exclusive deals!`;

    if (!this.isConfigured) {
      console.log(`[WhatsApp Mock] Welcome message to ${fullPhoneNumber}: ${message}`);
      return { success: true, mock: true };
    }

    try {
      await axios.post(
        `${this.whatsappApiUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to: fullPhoneNumber,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.whatsappAccessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return { success: true };
    } catch (error) {
      console.error('WhatsApp Welcome Error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  maskPhoneNumber(phone) {
    if (phone.length < 4) return phone;
    return phone.slice(0, -4).replace(/./g, '*') + phone.slice(-4);
  }
}

module.exports = new WhatsAppService();
