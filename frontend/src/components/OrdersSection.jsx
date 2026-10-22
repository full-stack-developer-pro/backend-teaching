import React, { useState, useEffect } from "react";
import api from "../api";

export default function OrdersSection({ user, showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewAllAdmin, setViewAllAdmin] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, viewAllAdmin]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Admin: GET /api/orders | Regular user: GET /api/orders/myorders
      const endpoint = viewAllAdmin && user?.role === "admin" ? "/orders" : "/orders/myorders";
      const res = await api.get(endpoint);
      setOrders(res.data.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  // View Single Order Details (GET /api/orders/:id)
  const handleViewOrderDetail = async (orderId) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/orders/${orderId}`);
      setSelectedOrderDetail(res.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load order receipt", "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  if (!user) {
    return (
      <div className="card empty-state">
        <div className="empty-state-icon">🔒</div>
        <h3>Authentication Required</h3>
        <p>
          Please log in to view your orders (Protected Route: <code>GET /api/orders/myorders</code>).
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <h3 className="card-title" style={{ margin: 0 }}>
          {viewAllAdmin && user.role === "admin"
            ? "👑 All Platform Orders (Admin View)"
            : "📦 My Orders"}
        </h3>

        {user.role === "admin" && (
          <div className="segmented-control">
            <button
              className={`segmented-btn ${!viewAllAdmin ? "active" : ""}`}
              onClick={() => setViewAllAdmin(false)}
            >
              My Orders
            </button>
            <button
              className={`segmented-btn ${viewAllAdmin ? "active" : ""}`}
              onClick={() => setViewAllAdmin(true)}
            >
              All Platform Orders (Admin)
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="empty-state">Loading order history...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>No Orders Found</h3>
          <p>
            Go to the Products tab and click "Order" on any product to create your first order.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Items Ordered</th>
                <th>Customer</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent-primary)" }}>
                      {o._id.slice(-8)}
                    </code>
                  </td>
                  <td>
                    {o.orderItems?.map((item, idx) => (
                      <div key={idx} style={{ fontSize: "13px" }}>
                        • {item.name} × {item.quantity} (${item.price?.toFixed(2)})
                      </div>
                    ))}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{o.user?.name || "Customer"}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {o.user?.email}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: "#34d399", fontSize: "15px" }}>
                    ${o.totalPrice?.toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        o.status === "delivered"
                          ? "badge-success"
                          : o.status === "paid"
                          ? "badge-user"
                          : "badge-admin"
                      }`}
                    >
                      {o.status || "pending"}
                    </span>
                  </td>
                  <td style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-outline btn-xs"
                      onClick={() => handleViewOrderDetail(o._id)}
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal (GET /api/orders/:id) */}
      {selectedOrderDetail && (
        <div className="modal-overlay" onClick={() => setSelectedOrderDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🧾 Order Receipt</h3>
              <button className="modal-close" onClick={() => setSelectedOrderDetail(null)}>
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Order Reference:</span>
                <code style={{ fontFamily: "var(--font-mono)" }}>{selectedOrderDetail._id}</code>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Customer:</span>
                <strong>{selectedOrderDetail.user?.name} ({selectedOrderDetail.user?.email})</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Order Status:</span>
                <span className="badge badge-success">{selectedOrderDetail.status || "pending"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Order Date:</span>
                <span>{new Date(selectedOrderDetail.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <h4 style={{ fontSize: "15px", marginBottom: "10px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "6px" }}>
              Items Purchased
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              {selectedOrderDetail.orderItems?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "var(--bg-surface-elevated)",
                    borderRadius: "8px",
                  }}
                >
                  <span>{item.name} × {item.quantity}</span>
                  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "14px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <span style={{ fontSize: "16px", fontWeight: 700 }}>Total Amount Paid:</span>
              <span style={{ fontSize: "22px", fontWeight: 800, color: "#34d399" }}>
                ${selectedOrderDetail.totalPrice?.toFixed(2)}
              </span>
            </div>

            <div style={{ marginTop: "24px", textAlign: "right" }}>
              <button className="btn btn-outline" onClick={() => setSelectedOrderDetail(null)}>
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
