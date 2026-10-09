import express from "express";
import {
  getPosts,
  getPost,
  getMyPosts,
  getUserPosts,
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

// Get posts for currently logged-in user
router.get("/myposts", protect, getMyPosts);

// Get posts by a specific user ID
router.get("/user/:userId", validateObjectId("userId"), getUserPosts);

router.route("/:id")
  .get(validateObjectId("id"), getPost)
  .put(protect, validateObjectId("id"), updatePost)
  .delete(protect, validateObjectId("id"), deletePost);

export default router;
