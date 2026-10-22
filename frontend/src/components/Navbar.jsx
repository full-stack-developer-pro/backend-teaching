import React from "react";

export default function Navbar({ user, onLogout, onSelectTab }) {
  return (
    <nav className="navbar">
      <div className="brand" onClick={() => onSelectTab("products")} style={{ cursor: "pointer" }}>
        <div className="brand-icon">⚡</div>
        <div>
          <h1 className="brand-title">MERN Masterclass</h1>
          <p className="brand-subtitle">Connected React • Express • MongoDB • Cloudinary</p>
        </div>
      </div>

      <div className="nav-user">
        {user ? (
          <>
            <div className="user-pill" onClick={() => onSelectTab("profile")} style={{ cursor: "pointer" }} title="View Profile">
              <div className="user-avatar-badge">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <span style={{ fontWeight: 700, fontSize: "13.5px" }}>{user.name}</span>{" "}
                <span className={`badge ${user.role === "admin" ? "badge-admin" : "badge-user"}`}>
                  {user.role === "admin" ? "👑 Admin" : "👤 User"}
                </span>
                <div style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>
                  {user.email}
                </div>
              </div>
            </div>

            <button className="btn btn-outline btn-sm" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="badge badge-guest">Public Guest</span>
            <button className="btn btn-primary btn-sm" onClick={() => onSelectTab("auth")}>
              🔑 Login / Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
