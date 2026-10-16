import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../services/cloudUploadService.js";

// Upload a single image to Local Storage (/uploads)
export const uploadSingleImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please select an image file to upload",
    });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: "Image uploaded to local storage successfully",
    fileName: req.file.filename,
    fileUrl, // Save this local path in MongoDB
  });
};

// Upload multiple images to Local Storage (up to 5)
export const uploadMultipleImages = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please select at least one image file",
    });
  }

  const fileUrls = req.files.map((file) => `/uploads/${file.filename}`);

  res.status(200).json({
    success: true,
    message: `${req.files.length} images uploaded to local storage successfully`,
    count: req.files.length,
    fileUrls,
  });
};

// Upload a single image to Cloudinary CDN
export const uploadToCloud = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image file to upload",
      });
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary credentials missing in .env!",
      });
    }

    const cloudResult = await uploadToCloudinary(req.file.path, "products");

    res.status(200).json({
      success: true,
      message: "Image uploaded to Cloudinary successfully",
      publicId: cloudResult.publicId,
      cloudUrl: cloudResult.url, // Save this HTTPS CDN URL in MongoDB
      format: cloudResult.format,
    });
  } catch (error) {
    next(error);
  }
};

// Upload multiple images to Cloudinary CDN (up to 5)
export const uploadMultipleToCloud = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one image file to upload",
      });
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary credentials missing in .env!",
      });
    }

    // Upload all files in parallel to Cloudinary
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.path, "products")
    );
    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: `${results.length} images uploaded to Cloudinary successfully`,
      count: results.length,
      images: results.map((r) => ({
        publicId: r.publicId,
        cloudUrl: r.url,
        format: r.format,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Delete a single image from Cloudinary by its publicId
export const deleteCloudImage = async (req, res, next) => {
  try {
    // Read publicId from request body or query param
    const publicId = req.body.publicId || req.query.publicId;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Please provide the 'publicId' of the image to delete",
      });
    }

    const result = await deleteFromCloudinary(publicId);

    if (result.result === "not found") {
      return res.status(404).json({
        success: false,
        message: `Image with publicId '${publicId}' not found on Cloudinary`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Image deleted from Cloudinary successfully",
      publicId,
      result: result.result, // "ok"
    });
  } catch (error) {
    next(error);
  }
};
