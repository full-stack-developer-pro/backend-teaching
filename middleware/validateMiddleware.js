import mongoose from "mongoose";

// Validate if a route parameter is a valid MongoDB ObjectId
export const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format: ${id}`,
      });
    }
    next();
  };
};

// Validate that required fields are present in the request body
export const validateRequiredFields = (fields = []) => {
  return (req, res, next) => {
    const missingFields = fields.filter((field) => req.body[field] === undefined || req.body[field] === "");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }
    next();
  };
};
