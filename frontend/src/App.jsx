import React, { useState, useEffect } from "react";
import api from "./api";
import Navbar from "./components/Navbar";
import AuthSection from "./components/AuthSection";
import ProductsSection from "./components/ProductsSection";
import OrdersSection from "./components/OrdersSection";
import PostsSection from "./components/PostsSection";
import AdminHub from "./components/AdminHub";
import ProfileSection from "./components/ProfileSection";

export default function App() {
  const [activeTab, setActiveTab] = useState("products");
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null); // { message, type }

  // Check if token exists in localStorage and fetch current user on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCurrentUser();
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      // GET /api/auth/me
      const res = await api.get("/auth/me");
      setUser(res.data.data);
    } catch (err) {
      console.warn("Session expired or invalid token");
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setActiveTab("products");
  };

  const handleLogout = async () => {
    try {
      // POST /api/auth/logout
      await api.post("/auth/logout");
    } catch (err) {
      // Backend logout acknowledged
    }
    localStorage.removeItem("token");
    setUser(null);
    setActiveTab("products");
    showToast("Logged out successfully", "success");
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Global Toast Alert Banner */}
      {toast && (
        <div className={`alert-banner alert-${toast.type}`}>
          <span>{toast.message}</span>
          <button className="alert-close" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          🛍️ Products & Uploads
        </button>

        <button
          className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          📦 Orders {user && <span className="tab-badge">Active</span>}
        </button>

        <button
          className={`tab-btn ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          📰 Community Posts
        </button>

        {/* Admin Hub Tab: Only visible if user has role === 'admin' */}
        {user?.role === "admin" && (
          <button
            className={`tab-btn ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => setActiveTab("admin")}
            style={{ border: "1px solid rgba(168, 85, 247, 0.4)" }}
          >
            👑 Admin Hub <span className="tab-badge">Admin Only</span>
          </button>
        )}

        {/* Profile Tab: Visible if logged in */}
        {user && (
          <button
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 My Profile
          </button>
        )}

        <button
          className={`tab-btn ${activeTab === "auth" ? "active" : ""}`}
          onClick={() => setActiveTab("auth")}
        >
          🔑 {user ? "Switch Account" : "Login / Register"}
        </button>
      </div>

      {/* Tab Panels */}
      <main>
        {activeTab === "products" && (
          <ProductsSection
            user={user}
            showToast={showToast}
            onProductOrdered={() => setActiveTab("orders")}
          />
        )}

        {activeTab === "orders" && (
          <OrdersSection user={user} showToast={showToast} />
        )}

        {activeTab === "posts" && (
          <PostsSection user={user} showToast={showToast} />
        )}

        {activeTab === "admin" && (
          <AdminHub user={user} showToast={showToast} />
        )}

        {activeTab === "profile" && (
          <ProfileSection
            user={user}
            onProfileUpdated={(updated) => setUser(updated)}
            showToast={showToast}
          />
        )}

        {activeTab === "auth" && (
          <AuthSection
            user={user}
            onLoginSuccess={handleLoginSuccess}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
}
