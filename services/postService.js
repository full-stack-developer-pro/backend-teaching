import Post from "../models/postModel.js";

// Fetch all posts with populated user details
export const getAllPosts = async () => {
  return await Post.find()
    .populate("user", "name email role")
    .sort({ createdAt: -1 });
};

// Fetch single post by ID with populated user details
export const getPostById = async (id) => {
  return await Post.findById(id).populate("user", "name email role");
};

// Create a new post
export const createPost = async (postData) => {
  const post = await Post.create(postData);
  return await post.populate("user", "name email");
};

// Get posts written by a specific user (One-to-Many lookup)
export const getPostsByUserId = async (userId) => {
  return await Post.find({ user: userId }).sort({ createdAt: -1 });
};

// Update post by ID
export const updatePostById = async (id, updateData) => {
  return await Post.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("user", "name email");
};

// Delete post by ID
export const deletePostById = async (id) => {
  return await Post.findByIdAndDelete(id);
};
