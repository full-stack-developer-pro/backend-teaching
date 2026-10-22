import React, { useState, useEffect } from "react";
import api from "../api";

export default function PostsSection({ user, showToast }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("all"); // "all" | "my"
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });

  // Edit Post State
  const [editingPost, setEditingPost] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: "", content: "" });

  // Single Post Detail State
  const [selectedPostDetail, setSelectedPostDetail] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [viewMode, user]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // GET /api/posts/myposts OR GET /api/posts
      const endpoint = viewMode === "my" && user ? "/posts/myposts" : "/posts";
      const res = await api.get(endpoint);
      setPosts(res.data.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load posts", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      return showToast("Please login to create a post", "error");
    }

    try {
      // POST /api/posts
      await api.post("/posts", formData);
      showToast("Post published successfully!", "success");
      setFormData({ title: "", content: "" });
      setShowForm(false);
      fetchPosts();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to publish post", "error");
    }
  };

  const handleEditClick = (post) => {
    setEditingPost(post);
    setEditFormData({ title: post.title, content: post.content });
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    try {
      // PUT /api/posts/:id
      await api.put(`/posts/${editingPost._id}`, editFormData);
      showToast("Post updated successfully!", "success");
      setEditingPost(null);
      fetchPosts();
      if (selectedPostDetail?._id === editingPost._id) {
        handleViewPost(editingPost._id);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update post", "error");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      // DELETE /api/posts/:id
      await api.delete(`/posts/${postId}`);
      showToast("Post deleted successfully", "success");
      fetchPosts();
      if (selectedPostDetail?._id === postId) setSelectedPostDetail(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed (requires author or admin)", "error");
    }
  };

  const handleViewPost = async (postId) => {
    try {
      // GET /api/posts/:id
      const res = await api.get(`/posts/${postId}`);
      setSelectedPostDetail(res.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load post detail", "error");
    }
  };

  const canManagePost = (post) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    const authorId = post.user?._id || post.user;
    return authorId === user._id;
  };

  return (
    <div>
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>
              📰 Community Articles & Posts
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Demonstrates <code>User → Posts</code> One-to-Many Relationship with Mongoose <code>.populate("user")</code>
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {user && (
              <div className="segmented-control">
                <button
                  className={`segmented-btn ${viewMode === "all" ? "active" : ""}`}
                  onClick={() => setViewMode("all")}
                >
                  All Posts
                </button>
                <button
                  className={`segmented-btn ${viewMode === "my" ? "active" : ""}`}
                  onClick={() => setViewMode("my")}
                >
                  My Posts
                </button>
              </div>
            )}

            {user && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "Cancel" : "+ Write Post"}
              </button>
            )}
          </div>
        </div>

        {/* Create Post Form */}
        {showForm && (
          <form
            onSubmit={handleCreatePost}
            style={{
              marginTop: "20px",
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: "16px",
            }}
          >
            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label>Post Title *</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. How to Connect React with Node.js and Cloudinary"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Post Content *</label>
              <textarea
                required
                className="form-control"
                placeholder="Write your article or thoughts..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Publish Post (POST /api/posts)
            </button>
          </form>
        )}
      </div>

      {loading ? (
        <div className="empty-state">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>No Posts Found</h3>
          <p>
            {viewMode === "my"
              ? "You haven't published any posts yet. Click '+ Write Post' to publish one!"
              : "No community posts have been published yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "18px" }}>
          {posts.map((post) => {
            const isAuthorized = canManagePost(post);

            return (
              <div key={post._id} className="card" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
                  <h4
                    style={{ fontSize: "18px", fontWeight: 700, cursor: "pointer", color: "#fff" }}
                    onClick={() => handleViewPost(post._id)}
                  >
                    {post.title}
                  </h4>

                  {isAuthorized && (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="btn btn-outline btn-xs"
                        onClick={() => handleEditClick(post)}
                        title="Edit Post"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger btn-xs"
                        onClick={() => handleDeletePost(post._id)}
                        title="Delete Post"
                      >
                        ✕ Delete
                      </button>
                    </div>
                  )}
                </div>

                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    marginBottom: "16px",
                    lineHeight: "1.65",
                  }}
                >
                  {post.content}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "12.5px",
                    color: "var(--text-tertiary)",
                    borderTop: "1px solid var(--border-subtle)",
                    paddingTop: "12px",
                  }}
                >
                  <div>
                    Author:{" "}
                    <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
                      {post.user?.name || "Community Member"}
                    </span>{" "}
                    <span style={{ color: "var(--text-tertiary)" }}>({post.user?.email || "No email"})</span>
                  </div>
                  <div>{new Date(post.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Post Modal (PUT /api/posts/:id) */}
      {editingPost && (
        <div className="modal-overlay" onClick={() => setEditingPost(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Edit Community Post</h3>
              <button className="modal-close" onClick={() => setEditingPost(null)}>
                ×
              </button>
            </div>

            <form onSubmit={handleUpdatePost}>
              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label>Post Title</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label>Post Content</label>
                <textarea
                  required
                  className="form-control"
                  style={{ minHeight: "120px" }}
                  value={editFormData.content}
                  onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingPost(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes (PUT /api/posts/:id)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Post Detail Modal (GET /api/posts/:id) */}
      {selectedPostDetail && (
        <div className="modal-overlay" onClick={() => setSelectedPostDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📖 {selectedPostDetail.title}</h3>
              <button className="modal-close" onClick={() => setSelectedPostDetail(null)}>
                ×
              </button>
            </div>

            <p style={{ fontSize: "15px", lineHeight: "1.7", color: "var(--text-primary)", marginBottom: "20px" }}>
              {selectedPostDetail.content}
            </p>

            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              <div><strong>Author:</strong> {selectedPostDetail.user?.name} ({selectedPostDetail.user?.email})</div>
              <div><strong>Published on:</strong> {new Date(selectedPostDetail.createdAt).toLocaleString()}</div>
            </div>

            <div style={{ textAlign: "right" }}>
              <button className="btn btn-outline" onClick={() => setSelectedPostDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
