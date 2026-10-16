import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Storage Configuration (Local Disk Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files in the /uploads folder
  },
  filename: (req, file, cb) => {
    // Generate unique file name: image-timestamp.ext
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
  },
});

// 2. File Validation Filter (Only Images: jpeg, jpg, png, webp)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp/;
  const isExtAllowed = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const isMimeAllowed = allowedExtensions.test(file.mimetype);

  if (isExtAllowed && isMimeAllowed) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, JPG, PNG, and WEBP image files are allowed!"
      ),
      false
    );
  }
};

// 3. Multer Configuration (Size limit: 5MB)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max file size
  fileFilter,
});

// Helper middlewares for single and multiple image uploads
export const uploadSingle = upload.single("image");
export const uploadMultiple = upload.array("images", 5);

export default upload;
