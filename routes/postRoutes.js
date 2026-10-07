import express from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getPosts)
  .post(protect, createPost);

router.route("/:id")
  .get(validateObjectId("id"), getPost)
  .put(protect, validateObjectId("id"), updatePost)
  .delete(protect, validateObjectId("id"), deletePost);

export default router;
