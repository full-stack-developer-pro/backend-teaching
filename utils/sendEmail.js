// Mock helper to send emails
export const sendEmail = async (options) => {
  console.log(`[Email Service] Mock email sent to: ${options.to}`);
  console.log(`[Email Service] Subject: ${options.subject}`);
  return {
    success: true,
    messageId: `mock-msg-${Date.now()}`,
  };
};

export default sendEmail;
