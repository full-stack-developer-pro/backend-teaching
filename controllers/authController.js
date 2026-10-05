import * as authService from "../services/authService.js";

// Register user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    const data = await authService.registerUser({ name, email, password, role });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: data.user,
      token: data.token,
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const data = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: data.user,
      token: data.token,
    });
  } catch (error) {
    next(error);
  }
};

// Get current logged-in user profile
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
