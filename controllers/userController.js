import * as userService from "../services/userService.js";

// Get all users (Admin only)
export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Get single user by ID
export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check permission: Only admin or the user themselves can view
    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this profile",
      });
    }

    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check permission: Only admin or the user themselves can edit
    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: "You are only allowed to update your own profile",
      });
    }

    const updateData = { ...req.body };
    if (req.user.role !== "admin") {
      delete updateData.role;
    }

    const updatedUser = await userService.updateUserById(id, updateData);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: `User not found with id: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (Admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: "Administrators cannot delete their own account",
      });
    }

    const deletedUser = await userService.deleteUserById(id);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: `User not found with id: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    next(error);
  }
};
