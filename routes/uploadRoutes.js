import express from "express";
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadToCloud,
  uploadMultipleToCloud,
  deleteCloudImage,
} from "../controllers/uploadController.js";
import { uploadSingle, uploadMultiple } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All upload routes require authentication
router.use(protect);

// ---------------- LOCAL STORAGE ---------------- //
// 1. Single Image Upload (Local Disk) - field: "image"
router.post("/", uploadSingle, uploadSingleImage);

// 2. Multiple Images Upload (Local Disk - up to 5) - field: "images"
router.post("/multiple", uploadMultiple, uploadMultipleImages);

// ---------------- CLOUDINARY CDN ---------------- //
// 3. Single Image Upload to Cloudinary - field: "image"
router.post("/cloud", uploadSingle, uploadToCloud);

// 4. Multiple Images Upload to Cloudinary (up to 5) - field: "images"
router.post("/cloud/multiple", uploadMultiple, uploadMultipleToCloud);

// 5. Delete Image from Cloudinary - body/query: { "publicId": "products/..." }
router.delete("/cloud", deleteCloudImage);

export default router;
