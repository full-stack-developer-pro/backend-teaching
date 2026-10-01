/**
 * Helper utility to generate a secure random token or identifier
 * @param {number} length - Desired token length
 * @returns {string} Generated token
 */
export const generateToken = (length = 32) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
};

export default generateToken;
