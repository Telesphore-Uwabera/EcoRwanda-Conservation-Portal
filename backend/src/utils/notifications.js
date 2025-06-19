function sendNotification({ recipients, title, message, type, link }) {
  console.log('Notification sent:', {
    recipients,
    title,
    message,
    type,
    link,
  });
}

module.exports = { sendNotification }; 