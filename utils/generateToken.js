import jwt from "jsonwebtoken";

// Generate a signed JWT token
export const generateToken = (userId, role = "user") => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || "fallback_default_secret_key",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
};

export default generateToken;
