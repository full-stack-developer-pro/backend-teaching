import React, { useState } from "react";
import api from "../api";

export default function AuthSection({ user, onLoginSuccess, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (
    email,
    password,
    isReg = isRegister,
    role = formData.role,
    name = formData.name,
  ) => {
    setLoading(true);
    try {
      if (isReg) {
        // POST /api/auth/register
        const res = await api.post("/auth/register", {
          name: name || "Test User",
          email,
          password,
          role,
        });
        localStorage.setItem("token", res.data.token);
        onLoginSuccess(res.data.data, res.data.token);
        showToast("Registered and logged in successfully!", "success");
      } else {
        // POST /api/auth/login
        const res = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
        onLoginSuccess(res.data.data, res.data.token);
        showToast("Logged in successfully!", "success");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Authentication failed";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAuth(formData.email, formData.password);
  };

  // Quick 1-click Demo Account Login / Registration Helper
  const handleQuickDemo = async (targetRole) => {
    const demoEmail =
      targetRole === "admin" ? "admin@demo.com" : "user@demo.com";
    const demoPassword = "Password123!";
    const demoName =
      targetRole === "admin" ? "Demo Administrator" : "Demo Customer";

    setLoading(true);
    try {
      // Try login first
      const res = await api.post("/auth/login", {
        email: demoEmail,
        password: demoPassword,
      });
      localStorage.setItem("token", res.data.token);
      onLoginSuccess(res.data.data, res.data.token);
      showToast(`Logged in as ${targetRole.toUpperCase()}!`, "success");
    } catch (loginErr) {
      // If user doesn't exist yet, auto register the demo account
      try {
        const regRes = await api.post("/auth/register", {
          name: demoName,
          email: demoEmail,
          password: demoPassword,
          role: targetRole,
        });
        localStorage.setItem("token", regRes.data.token);
        onLoginSuccess(regRes.data.data, regRes.data.token);
        showToast(
          `Created & logged in as ${targetRole.toUpperCase()}!`,
          "success",
        );
      } catch (regErr) {
        showToast(
          regErr.response?.data?.message || "Demo login failed",
          "error",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "560px", margin: "0 auto" }}>
      {/* 1-Click Demo Accounts Card */}
      <div className="demo-banner">
        <div>
          <strong>⚡ Quick Role Testing:</strong>
          <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
            Instantly switch between Administrator & Customer roles
          </div>
        </div>
        <div className="demo-banner-actions">
          <button
            type="button"
            className="btn btn-primary btn-xs"
            disabled={loading}
            onClick={() => handleQuickDemo("admin")}
          >
            👑 Log In as Admin
          </button>
          <button
            type="button"
            className="btn btn-outline btn-xs"
            disabled={loading}
            onClick={() => handleQuickDemo("user")}
          >
            👤 Log In as User
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">
          <span>{isRegister ? "Create New Account" : "User Login"}</span>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            Chapter 10 & 11 (JWT & RBAC)
          </span>
        </h2>

        {user ? (
          <div>
            <p style={{ marginBottom: "16px", color: "var(--text-secondary)" }}>
              You are currently authenticated as:
            </p>
            <div
              style={{
                background: "var(--bg-surface-elevated)",
                padding: "16px 20px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                marginBottom: "16px",
              }}
            >
              <div style={{ fontSize: "17px", fontWeight: "700" }}>
                {user.name}
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                {user.email}
              </div>
              <div style={{ marginTop: "10px" }}>
                <span
                  className={`badge ${user.role === "admin" ? "badge-admin" : "badge-user"}`}
                >
                  Role: {user.role}
                </span>
              </div>
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
              }}
            >
              JWT Token is stored in <code>localStorage</code> and automatically
              attached to every request header:{" "}
              <code>Authorization: Bearer &lt;token&gt;</code>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                required
                className="form-control"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {isRegister && (
              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="form-control"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                required
                className="form-control"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {isRegister && (
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label>Assigned Role (RBAC Integration)</label>
                <select
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">User (Standard customer)</option>
                  <option value="admin">
                    Admin (Full administrative privileges)
                  </option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "8px" }}
            >
              {loading
                ? "Connecting to backend..."
                : isRegister
                  ? "Register Account (POST /api/auth/register)"
                  : "Sign In (POST /api/auth/login)"}
            </button>

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="btn btn-outline btn-sm"
              >
                {isRegister
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Register"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
