import * as postService from "../services/postService.js";

// Get all posts (with search, sort, pagination)
export const getPosts = async (req, res, next) => {
  try {
    const result = await postService.getAllPosts(req.query);
    res.status(200).json({
      success: true,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      data: result.posts,
    });
  } catch (error) {
    next(error);
  }
};

// Get single post by ID
export const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await postService.getPostById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: `Post not found with id: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// Get posts created by the currently logged-in user
export const getMyPosts = async (req, res, next) => {
  try {
    const result = await postService.getPostsByUserId(req.user._id, req.query);
    res.status(200).json({
      success: true,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      data: result.posts,
    });
  } catch (error) {
    next(error);
  }
};

// Get posts created by a specific user ID
export const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await postService.getPostsByUserId(userId, req.query);
    res.status(200).json({
      success: true,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      data: result.posts,
    });
  } catch (error) {
    next(error);
  }
};

// Create new post (Logged in user)
export const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Please provide title and content",
      });
    }

    const post = await postService.createPost({
      title,
      content,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// Update post (Author or Admin)
export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingPost = await postService.getPostById(id);

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: `Post not found with id: ${id}`,
      });
    }

    // Ownership check: Only author or admin can edit
    if (
      req.user.role !== "admin" &&
      existingPost.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this post",
      });
    }

    const updatedPost = await postService.updatePostById(id, req.body);

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// Delete post (Author or Admin)
export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingPost = await postService.getPostById(id);

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: `Post not found with id: ${id}`,
      });
    }

    // Ownership check: Only author or admin can delete
    if (
      req.user.role !== "admin" &&
      existingPost.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this post",
      });
    }

    const deletedPost = await postService.deletePostById(id);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      data: deletedPost,
    });
  } catch (error) {
    next(error);
  }
};
