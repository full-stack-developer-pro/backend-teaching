import User from "../models/userModel.js";

// Get all users
export const getAllUsers = async () => {
  return await User.find().select("-password").sort({ createdAt: -1 });
};

// Get single user by ID
export const getUserById = async (id) => {
  return await User.findById(id).select("-password");
};

// Update user details
export const updateUserById = async (id, updateData) => {
  const allowedUpdates = { ...updateData };
  delete allowedUpdates.password;

  return await User.findByIdAndUpdate(id, allowedUpdates, {
    new: true,
    runValidators: true,
  }).select("-password");
};

// Delete user by ID
export const deleteUserById = async (id) => {
  return await User.findByIdAndDelete(id);
};
