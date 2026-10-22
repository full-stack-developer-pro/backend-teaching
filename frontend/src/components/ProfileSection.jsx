import React, { useState, useEffect } from "react";
import api from "../api";

export default function ProfileSection({ user, onProfileUpdated, showToast }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      return showToast("Name and email are required", "error");
    }

    setUpdating(true);
    try {
      // PUT /api/users/:id
      const res = await api.put(`/users/${user._id}`, { name, email });
      showToast("Profile updated successfully!", "success");
      if (onProfileUpdated) {
        onProfileUpdated(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="card empty-state">
        <div className="empty-state-icon">🔒</div>
        <h3>Please Log In</h3>
        <p>You need to be logged in to view and update your profile.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div className="card">
        <h2 className="card-title">
          <span>👤 My Profile</span>
          <span className={`badge ${user.role === "admin" ? "badge-admin" : "badge-user"}`}>
            {user.role}
          </span>
        </h2>

        <form onSubmit={handleUpdateProfile}>
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label>Full Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label>Assigned Role (Managed by Backend RBAC)</label>
            <input
              type="text"
              className="form-control"
              value={user.role}
              disabled
              style={{ opacity: 0.7 }}
            />
            <small style={{ color: "var(--text-tertiary)" }}>
              Role cannot be modified by user accounts to protect backend security.
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={updating}
          >
            {updating ? "Saving Changes..." : "Save Profile Changes (PUT /api/users/:id)"}
          </button>
        </form>
      </div>
    </div>
  );
}
