import React, { useState, useEffect } from "react";
import api from "../api";

export default function AdminHub({ user, showToast }) {
  const [activeSubTab, setActiveSubTab] = useState("categories");

  // Categories State
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Users State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // Cloudinary / Media State
  const [multiCloudFiles, setMultiCloudFiles] = useState([]);
  const [multiLocalFiles, setMultiLocalFiles] = useState([]);
  const [uploadingMulti, setUploadingMulti] = useState(false);
  const [uploadedGallery, setUploadedGallery] = useState([]);
  const [deletePublicId, setDeletePublicId] = useState("");
  const [deletingCloud, setDeletingCloud] = useState(false);

  useEffect(() => {
    if (activeSubTab === "categories") {
      fetchCategories();
    } else if (activeSubTab === "users") {
      fetchUsers();
    }
  }, [activeSubTab]);

  // ---------------- CATEGORY CRUD (Admin) ---------------- //
  const fetchCategories = async () => {
    setCategoryLoading(true);
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load categories", "error");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      return showToast("Category name is required", "error");
    }

    try {
      if (editingCategory) {
        // PUT /api/categories/:id
        await api.put(`/categories/${editingCategory._id}`, {
          name: categoryName,
          description: categoryDesc,
        });
        showToast("Category updated successfully", "success");
      } else {
        // POST /api/categories
        await api.post("/categories", {
          name: categoryName,
          description: categoryDesc,
        });
        showToast("Category created successfully", "success");
      }
      setCategoryName("");
      setCategoryDesc("");
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed", "error");
    }
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDesc(cat.description || "");
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      // DELETE /api/categories/:id
      await api.delete(`/categories/${catId}`);
      showToast("Category deleted successfully", "success");
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete category", "error");
    }
  };

  // ---------------- USER ADMINISTRATION (Admin) ---------------- //
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      // GET /api/users (Admin only)
      const res = await api.get("/users");
      setUsers(res.data.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load users", "error");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      // GET /api/users/:id
      const res = await api.get(`/users/${userId}`);
      setSelectedUserDetail(res.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load user details", "error");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user account?")) return;
    try {
      // DELETE /api/users/:id (Admin only)
      await api.delete(`/users/${userId}`);
      showToast("User account deleted successfully", "success");
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete user", "error");
    }
  };

  // ---------------- CLOUDINARY & LOCAL MULTI-UPLOAD ---------------- //
  const handleUploadMultiCloud = async (e) => {
    e.preventDefault();
    if (!multiCloudFiles || multiCloudFiles.length === 0) {
      return showToast("Select up to 5 images to upload to Cloudinary", "error");
    }

    const formData = new FormData();
    for (let i = 0; i < multiCloudFiles.length; i++) {
      formData.append("images", multiCloudFiles[i]);
    }

    setUploadingMulti(true);
    try {
      // POST /api/upload/cloud/multiple
      const res = await api.post("/upload/cloud/multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast(res.data.message || "Uploaded to Cloudinary!", "success");
      setUploadedGallery((prev) => [...(res.data.images || []), ...prev]);
      setMultiCloudFiles([]);
    } catch (err) {
      showToast(err.response?.data?.message || "Cloudinary upload failed", "error");
    } finally {
      setUploadingMulti(false);
    }
  };

  const handleUploadMultiLocal = async (e) => {
    e.preventDefault();
    if (!multiLocalFiles || multiLocalFiles.length === 0) {
      return showToast("Select up to 5 images to upload locally", "error");
    }

    const formData = new FormData();
    for (let i = 0; i < multiLocalFiles.length; i++) {
      formData.append("images", multiLocalFiles[i]);
    }

    setUploadingMulti(true);
    try {
      // POST /api/upload/multiple
      const res = await api.post("/upload/multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast(res.data.message || "Uploaded locally!", "success");
      const formatted = (res.data.fileUrls || []).map((url) => ({
        cloudUrl: `http://localhost:5000${url}`,
        publicId: "local-file",
      }));
      setUploadedGallery((prev) => [...formatted, ...prev]);
      setMultiLocalFiles([]);
    } catch (err) {
      showToast(err.response?.data?.message || "Local upload failed", "error");
    } finally {
      setUploadingMulti(false);
    }
  };

  const handleDeleteCloudImage = async (pubId) => {
    const targetId = pubId || deletePublicId;
    if (!targetId.trim()) {
      return showToast("Please specify the Cloudinary publicId to delete", "error");
    }

    setDeletingCloud(true);
    try {
      // DELETE /api/upload/cloud (body: { publicId })
      await api.delete("/upload/cloud", { data: { publicId: targetId } });
      showToast(`Image '${targetId}' deleted from Cloudinary!`, "success");
      setUploadedGallery((prev) => prev.filter((img) => img.publicId !== targetId));
      if (!pubId) setDeletePublicId("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete Cloudinary image", "error");
    } finally {
      setDeletingCloud(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="card empty-state">
        <div className="empty-state-icon">🔒</div>
        <h3>Admin Access Only</h3>
        <p>You must be logged in as an Administrator to view and access this panel.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sub-navigation tabs inside Admin Hub */}
      <div className="sub-tabs">
        <button
          className={`sub-tab-btn ${activeSubTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveSubTab("categories")}
        >
          📂 Category Management (CRUD)
        </button>
        <button
          className={`sub-tab-btn ${activeSubTab === "users" ? "active" : ""}`}
          onClick={() => setActiveSubTab("users")}
        >
          👥 User Directory & Roles
        </button>
        <button
          className={`sub-tab-btn ${activeSubTab === "media" ? "active" : ""}`}
          onClick={() => setActiveSubTab("media")}
        >
          ☁️ Cloudinary & Media Center
        </button>
      </div>

      {/* ---------------- 1. CATEGORIES MANAGEMENT ---------------- */}
      {activeSubTab === "categories" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
          <div className="card">
            <h3 className="card-title">
              {editingCategory ? "✏️ Edit Category" : "➕ Create Category"}
            </h3>
            <form onSubmit={handleSaveCategory}>
              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label>Category Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Laptops & Computers"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label>Description</label>
                <textarea
                  className="form-control"
                  placeholder="Short description of this category"
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingCategory ? "Update Category" : "Create Category"}
                </button>
                {editingCategory && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryName("");
                      setCategoryDesc("");
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card">
            <h3 className="card-title">
              <span>All Categories ({categories.length})</span>
              <button className="btn btn-outline btn-sm" onClick={fetchCategories}>
                🔄 Refresh
              </button>
            </h3>

            {categoryLoading ? (
              <p style={{ color: "var(--text-secondary)" }}>Loading categories...</p>
            ) : categories.length === 0 ? (
              <p style={{ color: "var(--text-secondary)" }}>No categories created yet.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>ID</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat._id}>
                        <td style={{ fontWeight: 600 }}>{cat.name}</td>
                        <td style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                          {cat.description || "—"}
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-tertiary)" }}>
                          {cat._id.slice(-6)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn btn-outline btn-xs"
                            style={{ marginRight: "6px" }}
                            onClick={() => handleEditCategory(cat)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-xs"
                            onClick={() => handleDeleteCategory(cat._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 2. USER DIRECTORY ---------------- */}
      {activeSubTab === "users" && (
        <div className="card">
          <h3 className="card-title">
            <span>Registered Users & Administrators ({users.length})</span>
            <button className="btn btn-outline btn-sm" onClick={fetchUsers}>
              🔄 Refresh
            </button>
          </h3>

          {usersLoading ? (
            <p style={{ color: "var(--text-secondary)" }}>Loading registered users...</p>
          ) : users.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>No users found.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === "admin" ? "badge-admin" : "badge-user"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="btn btn-outline btn-xs"
                          style={{ marginRight: "6px" }}
                          onClick={() => handleViewUser(u._id)}
                        >
                          View
                        </button>
                        {u._id !== user._id && (
                          <button
                            className="btn btn-danger btn-xs"
                            onClick={() => handleDeleteUser(u._id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---------------- 3. CLOUDINARY & MEDIA MANAGER ---------------- */}
      {activeSubTab === "media" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
            {/* Multi-Upload to Cloudinary */}
            <div className="card">
              <h3 className="card-title">☁️ Upload Multiple to Cloudinary</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px" }}>
                Tests backend endpoint <code>POST /api/upload/cloud/multiple</code> (Up to 5 images uploaded in parallel).
              </p>
              <form onSubmit={handleUploadMultiCloud}>
                <div className="form-group" style={{ marginBottom: "14px" }}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => setMultiCloudFiles(Array.from(e.target.files))}
                  />
                  <small style={{ color: "var(--text-tertiary)" }}>
                    {multiCloudFiles.length} file(s) selected
                  </small>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploadingMulti || multiCloudFiles.length === 0}
                >
                  {uploadingMulti ? "Uploading to Cloudinary..." : "Upload to Cloudinary"}
                </button>
              </form>
            </div>

            {/* Delete from Cloudinary */}
            <div className="card">
              <h3 className="card-title">🗑️ Delete Image from Cloudinary</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px" }}>
                Tests backend endpoint <code>DELETE /api/upload/cloud</code> using Cloudinary <code>publicId</code>.
              </p>
              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label>Cloudinary Public ID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. products/image-1718293812"
                  value={deletePublicId}
                  onChange={(e) => setDeletePublicId(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-danger"
                disabled={deletingCloud || !deletePublicId.trim()}
                onClick={() => handleDeleteCloudImage()}
              >
                {deletingCloud ? "Deleting from Cloud..." : "Delete from Cloudinary"}
              </button>
            </div>
          </div>

          {/* Uploaded Gallery Preview */}
          {uploadedGallery.length > 0 && (
            <div className="card">
              <h3 className="card-title">🖼️ Uploaded Cloud Gallery Preview</h3>
              <div className="media-grid">
                {uploadedGallery.map((item, idx) => (
                  <div key={idx} className="media-card">
                    <img src={item.cloudUrl} alt="Upload" />
                    {item.publicId && item.publicId !== "local-file" && (
                      <button
                        className="media-delete-overlay"
                        title="Delete from Cloudinary"
                        onClick={() => handleDeleteCloudImage(item.publicId)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUserDetail && (
        <div className="modal-overlay" onClick={() => setSelectedUserDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">👤 User Details</h3>
              <button className="modal-close" onClick={() => setSelectedUserDetail(null)}>
                ×
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div><strong>Name:</strong> {selectedUserDetail.name}</div>
              <div><strong>Email:</strong> {selectedUserDetail.email}</div>
              <div>
                <strong>Role:</strong>{" "}
                <span className={`badge ${selectedUserDetail.role === "admin" ? "badge-admin" : "badge-user"}`}>
                  {selectedUserDetail.role}
                </span>
              </div>
              <div><strong>User ID:</strong> <code style={{ fontFamily: "var(--font-mono)" }}>{selectedUserDetail._id}</code></div>
              <div><strong>Registered At:</strong> {new Date(selectedUserDetail.createdAt).toLocaleString()}</div>
            </div>
            <div style={{ marginTop: "24px", textAlign: "right" }}>
              <button className="btn btn-outline" onClick={() => setSelectedUserDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
