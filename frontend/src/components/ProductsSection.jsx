import React, { useState, useEffect } from "react";
import api, { BASE_URL } from "../api";

export default function ProductsSection({ user, showToast, onProductOrdered }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter & Query States
  const [viewMode, setViewMode] = useState("all"); // "all" | "my"
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 8 });

  // Add Product Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: "",
    inStock: true,
  });

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: "",
    inStock: true,
  });

  // Single Product Detail Modal State
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Upload States
  const [uploadMode, setUploadMode] = useState("cloud"); // Default to Cloudinary
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [viewMode, search, selectedCategory, sortBy, page]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
      if (res.data.data?.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: res.data.data[0]._id }));
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8, sort: sortBy };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;

      // GET /api/products/myproducts OR GET /api/products
      const endpoint = viewMode === "my" && user ? "/products/myproducts" : "/products";
      const res = await api.get(endpoint, { params });

      setProducts(res.data.data || []);
      setPagination({
        total: res.data.total || 0,
        totalPages: res.data.totalPages || 1,
        limit: res.data.limit || 8,
      });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  // View Single Product Details (GET /api/products/:id)
  const handleViewDetails = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/products/${id}`);
      setSelectedProductDetail(res.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load product details", "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Upload Single Image (Local or Cloudinary)
  const handleImageUpload = async (file, isEdit = false) => {
    if (!file) return;
    if (!user) {
      return showToast("Please login first to upload images", "error");
    }

    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    setUploadingImage(true);
    try {
      const endpoint = uploadMode === "cloud" ? "/upload/cloud" : "/upload";
      const res = await api.post(endpoint, uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = uploadMode === "cloud" ? res.data.cloudUrl : res.data.fileUrl;
      if (isEdit) {
        setEditFormData((prev) => ({ ...prev, image: uploadedUrl }));
      } else {
        setFormData((prev) => ({ ...prev, image: uploadedUrl }));
      }
      setImagePreview(uploadedUrl.startsWith("http") ? uploadedUrl : `${BASE_URL}${uploadedUrl}`);
      showToast(`Image uploaded to ${uploadMode === "cloud" ? "Cloudinary CDN" : "Local Disk"}!`, "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Image upload failed", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // Create Product (POST /api/products)
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!user) {
      return showToast("Please login first to create products", "error");
    }

    try {
      await api.post("/products", {
        ...formData,
        price: Number(formData.price),
      });
      showToast("Product created successfully!", "success");
      setShowAddForm(false);
      setFormData({
        name: "",
        price: "",
        description: "",
        category: categories[0]?._id || "",
        image: "",
        inStock: true,
      });
      setImagePreview("");
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create product", "error");
    }
  };

  // Open Edit Modal
  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      price: product.price,
      description: product.description || "",
      category: product.category?._id || product.category || categories[0]?._id || "",
      image: product.image || "",
      inStock: product.inStock !== false,
    });
    setImagePreview(product.image ? (product.image.startsWith("http") ? product.image : `${BASE_URL}${product.image}`) : "");
  };

  // Update Product (PUT /api/products/:id)
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/products/${editingProduct._id}`, {
        ...editFormData,
        price: Number(editFormData.price),
      });
      showToast("Product updated successfully!", "success");
      setEditingProduct(null);
      fetchProducts();
      if (selectedProductDetail?._id === editingProduct._id) {
        handleViewDetails(editingProduct._id);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed (Owner/Admin required)", "error");
    }
  };

  // Delete Product (DELETE /api/products/:id)
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      showToast("Product deleted successfully", "success");
      fetchProducts();
      if (selectedProductDetail?._id === id) setSelectedProductDetail(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed (requires owner or admin)", "error");
    }
  };

  // Place Order (POST /api/orders)
  const handleOrderClick = async (product) => {
    if (!user) {
      return showToast("Please login to place an order", "error");
    }
    try {
      await api.post("/orders", {
        orderItems: [
          {
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ],
        totalPrice: product.price,
      });
      showToast(`Order placed for ${product.name}!`, "success");
      if (onProductOrdered) onProductOrdered();
    } catch (err) {
      showToast(err.response?.data?.message || "Order placement failed", "error");
    }
  };

  const canEditOrDelete = (product) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    const prodUserId = product.user?._id || product.user;
    return prodUserId === user._id;
  };

  return (
    <div>
      {/* Top Filter & Action Bar */}
      <div className="toolbar">
        {user && (
          <div className="segmented-control">
            <button
              className={`segmented-btn ${viewMode === "all" ? "active" : ""}`}
              onClick={() => { setViewMode("all"); setPage(1); }}
            >
              All Products
            </button>
            <button
              className={`segmented-btn ${viewMode === "my" ? "active" : ""}`}
              onClick={() => { setViewMode("my"); setPage(1); }}
            >
              My Created Products
            </button>
          </div>
        )}

        <div className="toolbar-search">
          <input
            type="text"
            className="form-control"
            placeholder="Search products by name... (?search=...)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="form-control"
          style={{ width: "auto" }}
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="form-control"
          style={{ width: "auto" }}
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
        >
          <option value="-createdAt">Newest First (?sort=-createdAt)</option>
          <option value="price">Price: Low to High (?sort=price)</option>
          <option value="-price">Price: High to Low (?sort=-price)</option>
          <option value="name">Name (A-Z)</option>
        </select>

        {user && (
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Close Form" : "+ Create Product"}
          </button>
        )}
      </div>

      {/* Create Product Form Card */}
      {showAddForm && (
        <div className="card" style={{ border: "1px solid var(--border-hover)" }}>
          <h3 className="card-title">
            <span>➕ Create New Product</span>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Supports Local Disk or Cloudinary Upload
            </span>
          </h3>
          <form onSubmit={handleCreateProduct}>
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="form-control"
                  placeholder="149.99"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Category (Mongoose ObjectId ref)</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Upload Storage Destination</label>
                <select
                  className="form-control"
                  value={uploadMode}
                  onChange={(e) => setUploadMode(e.target.value)}
                >
                  <option value="cloud">Cloudinary Cloud CDN (Recommended)</option>
                  <option value="local">Local Server Storage (/uploads)</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "16px" }}>
              <label>Description</label>
              <textarea
                className="form-control"
                placeholder="Product specs, features, warranty, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "18px" }}>
              <label>Upload Image (Multer Integration)</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => handleImageUpload(e.target.files[0], false)}
              />
              {uploadingImage && (
                <small style={{ color: "var(--info)" }}>
                  Uploading image to {uploadMode === "cloud" ? "Cloudinary CDN..." : "local server..."}
                </small>
              )}
              {imagePreview && (
                <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "8px" }}
                  />
                  <small style={{ color: "var(--text-secondary)", wordBreak: "break-all" }}>
                    Stored Image URL: {formData.image}
                  </small>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={uploadingImage}>
              Save Product (POST /api/products)
            </button>
          </form>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="empty-state">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No Products Found</h3>
          <p>
            {viewMode === "my"
              ? "You haven't created any products yet. Click '+ Create Product' to add one."
              : "Try clearing your search query or category filter."}
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((p) => {
            const displayImg = p.image
              ? p.image.startsWith("http")
                ? p.image
                : `${BASE_URL}${p.image}`
              : "https://placehold.co/400x300/111827/white?text=No+Image";

            const userCanManage = canEditOrDelete(p);

            return (
              <div key={p._id} className="product-card">
                <div className="product-img-wrapper" onClick={() => handleViewDetails(p._id)} style={{ cursor: "pointer" }}>
                  <img
                    src={displayImg}
                    alt={p.name}
                    className="product-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/400x300/111827/white?text=Image";
                    }}
                  />
                  <div className="product-badge-overlay">
                    <span className={`badge ${p.inStock !== false ? "badge-success" : "badge-danger"}`}>
                      {p.inStock !== false ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>

                <div className="product-body">
                  <h4
                    className="product-title"
                    onClick={() => handleViewDetails(p._id)}
                    style={{ cursor: "pointer" }}
                  >
                    {p.name}
                  </h4>
                  <div className="product-category">
                    📁 {p.category?.name || "Uncategorized"}
                  </div>
                  <p className="product-desc">
                    {p.description || "No description provided."}
                  </p>

                  <div className="product-footer">
                    <span className="product-price">${p.price?.toFixed(2)}</span>
                    <div className="product-actions">
                      <button
                        className="btn btn-outline btn-xs"
                        onClick={() => handleViewDetails(p._id)}
                        title="View Details"
                      >
                        Details
                      </button>
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() => handleOrderClick(p)}
                        title="Order Now"
                      >
                        Order
                      </button>
                      {userCanManage && (
                        <>
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => openEditModal(p)}
                            title="Edit Product"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-danger btn-xs"
                            onClick={() => handleDeleteProduct(p._id)}
                            title="Delete Product"
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-outline btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>
          <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Page {page} of {pagination.totalPages} ({pagination.total} total products)
          </span>
          <button
            className="btn btn-outline btn-sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Product Detail Modal (GET /api/products/:id) */}
      {selectedProductDetail && (
        <div className="modal-overlay" onClick={() => setSelectedProductDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📦 Product Overview</h3>
              <button className="modal-close" onClick={() => setSelectedProductDetail(null)}>
                ×
              </button>
            </div>

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px" }}>
              <img
                src={
                  selectedProductDetail.image
                    ? selectedProductDetail.image.startsWith("http")
                      ? selectedProductDetail.image
                      : `${BASE_URL}${selectedProductDetail.image}`
                    : "https://placehold.co/400x300/111827/white?text=No+Image"
                }
                alt={selectedProductDetail.name}
                style={{ width: "200px", height: "160px", objectFit: "cover", borderRadius: "12px" }}
              />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                <h4 style={{ fontSize: "20px", fontWeight: 700 }}>{selectedProductDetail.name}</h4>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#34d399" }}>
                  ${selectedProductDetail.price?.toFixed(2)}
                </div>
                <div>
                  <strong>Category:</strong> {selectedProductDetail.category?.name || "General"}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <span className={`badge ${selectedProductDetail.inStock !== false ? "badge-success" : "badge-danger"}`}>
                    {selectedProductDetail.inStock !== false ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <div>
                  <strong>Creator:</strong> {selectedProductDetail.user?.name || "Community Member"}
                </div>
              </div>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
              {selectedProductDetail.description || "No full description provided for this item."}
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <small style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                ID: {selectedProductDetail._id}
              </small>
              <div style={{ display: "flex", gap: "8px" }}>
                {canEditOrDelete(selectedProductDetail) && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      openEditModal(selectedProductDetail);
                      setSelectedProductDetail(null);
                    }}
                  >
                    Edit Product
                  </button>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    handleOrderClick(selectedProductDetail);
                    setSelectedProductDetail(null);
                  }}
                >
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal (PUT /api/products/:id) */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Edit Product</h3>
              <button className="modal-close" onClick={() => setEditingProduct(null)}>
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateProduct}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="form-control"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>In Stock</label>
                  <select
                    className="form-control"
                    value={editFormData.inStock ? "true" : "false"}
                    onChange={(e) => setEditFormData({ ...editFormData, inStock: e.target.value === "true" })}
                  >
                    <option value="true">In Stock</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label>Description</label>
                <textarea
                  className="form-control"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "18px" }}>
                <label>Replace Image (Multer / Cloudinary)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => handleImageUpload(e.target.files[0], true)}
                />
                {uploadingImage && <small style={{ color: "var(--info)" }}>Uploading new image...</small>}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploadingImage}>
                  Save Changes (PUT /api/products/:id)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
