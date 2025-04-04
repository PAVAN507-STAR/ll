module.exports = {
  PORT: process.env.PORT || 5000,
  DB_URI: process.env.DB_URI || 'mongodb://localhost:27017/little_library',
  MEMBERSHIP_FEE: process.env.MEMBERSHIP_FEE || 100,
  // Twilio configuration for WhatsApp reminders
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  FROM_WHATSAPP: process.env.FROM_WHATSAPP,
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  // Admin Configuration
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123' // This should be changed in production
};
