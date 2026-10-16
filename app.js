import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";

// Middlewares
import loggerMiddleware from "./middleware/loggerMiddleware.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();

// Security Headers (Chapter 13) - allow cross-origin image loading
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS Configuration (Chapter 13)
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parsers with payload size limits (Security practice)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Serve Uploaded Files Statically (Chapter 16: Local Storage)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Request Logger
app.use(loggerMiddleware);

// Rate Limiting on all API routes (Chapter 13)
app.use("/api", apiLimiter);

// Welcome Root Route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Backend Teaching API (Security, Relationships & File Uploads)",
    modules: {
      auth: "/api/auth",
      users: "/api/users",
      categories: "/api/categories",
      products: "/api/products",
      posts: "/api/posts",
      orders: "/api/orders",
      uploads: "/api/upload",
    },
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);

// Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;
