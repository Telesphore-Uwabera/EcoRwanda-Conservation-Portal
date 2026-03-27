const axios = require('axios');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendEmail = async (options) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'EcoRwanda Conservation Portal';

  if (!apiKey) throw new Error('BREVO_API_KEY is not defined in environment variables');
  if (!senderEmail) throw new Error('BREVO_SENDER_EMAIL is not defined in environment variables');

  const payload = {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: options.email }],
    subject: options.subject,
    textContent: options.message,
  };

  await axios.post(BREVO_API_URL, payload, {
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    timeout: 15000,
  });
};

module.exports = sendEmail;