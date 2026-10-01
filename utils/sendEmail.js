/**
 * Mock/Helper utility to send emails
 * @param {Object} options - Email options { to, subject, text, html }
 */
export const sendEmail = async (options) => {
  // In a production app, configure nodemailer or SendGrid/Resend here
  console.log(`[Email Service] Mock email sent to: ${options.to}`);
  console.log(`[Email Service] Subject: ${options.subject}`);
  return {
    success: true,
    messageId: `mock-msg-${Date.now()}`,
  };
};

export default sendEmail;
