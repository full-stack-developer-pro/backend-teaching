import fs from "fs";
import cloudinary from "../config/cloudinary.js";

// Upload a local file to Cloudinary and clean up local temporary file
export const uploadToCloudinary = async (filePath, folder = "products") => {
  try {
    // 1. Upload to Cloudinary CDN
    const result = await cloudinary.uploader.upload(filePath, {
      folder, // Creates or uses a folder in Cloudinary
      resource_type: "image",
    });


    return {
      publicId: result.public_id,
      url: result.secure_url, // HTTPS permanent CDN URL for MongoDB
      format: result.format,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    // Clean up local file even if cloud upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Cloudinary Upload Error: ${error.message}`);
  }
};

// Delete an image from Cloudinary by its publicId
export const deleteFromCloudinary = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Cloudinary Delete Error: ${error.message}`);
  }
};

export default uploadToCloudinary;
