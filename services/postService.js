import Post from "../models/postModel.js";

// Fetch all posts with search and pagination
export const getAllPosts = async (queryParams = {}) => {
  const { search, page = 1, limit = 10, sort = "-createdAt" } = queryParams;

  const filter = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const total = await Post.countDocuments(filter);
  const posts = await Post.find(filter)
    .populate("user", "name email role")
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

  return {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    posts,
  };
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

// Get posts written by a specific user with pagination
export const getPostsByUserId = async (userId, queryParams = {}) => {
  const pageNum = Number(queryParams.page) || 1;
  const limitNum = Number(queryParams.limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const total = await Post.countDocuments({ user: userId });
  const posts = await Post.find({ user: userId })
    .populate("user", "name email")
    .sort("-createdAt")
    .skip(skip)
    .limit(limitNum);

  return {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    posts,
  };
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
