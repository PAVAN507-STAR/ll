// const twilio = require('twilio');
// const config = require('../config/config');

// const client = new twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

// exports.sendReminder = async (to, message) => {
//   try {
//     console.log(`🚀 Sending WhatsApp message to: ${to}`);

//     if (!to) throw new Error('❌ Recipient phone number is required');

//     const response = await client.messages.create({
//       body: message,
//       from: config.FROM_WHATSAPP,  // Using config variable
//       to: `whatsapp:+91${to}` // Ensure TO starts with 'whatsapp:' and has country code
//     });
    
//     console.log('✅ Reminder sent successfully:', response.sid);
//     return response;
//   } catch (error) {
//     console.error('❌ Twilio Error:', error.message);
//     throw error;
//   }
// };

const axios = require('axios');

const ACCESS_TOKEN = 'EAARAQZB6DE3IBO2EOkaZAu5HZBNSbpSTRlv7IbHDECyStgNwVqBVRpVTBppECwnhO6Iovg9QzyqAsYngoANfYkE42atfOVLY5HeGhVZCivuph9FtmguRYjmeIWRhdbSBa9Fc18ZA3SycpZB1GhqDImY3aM0uJdSWFm5a0C8JGfECPM39Cluj1OBCdoHLbnzhPc31Ors9nwdXLEWppPGcXbTZC7AMM8ZD'; 
const PHONE_NUMBER_ID = '639870112333687';

exports.sendReminder = async (to, message) => {
  try {
    console.log(`🚀 Sending WhatsApp message to: ${to}`);

    if (!to) throw new Error('❌ Recipient phone number is required');

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: `+91${to}`,
        type: "text",
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log('✅ Reminder sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ WhatsApp API Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};
