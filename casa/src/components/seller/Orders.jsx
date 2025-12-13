// File: src/components/SupplierOrders.jsx
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import NotificationButton from "./NotificationButton";
import "./Orders.css";

const initialOrders = [
  { id: 1, customer: "Customer A", material: "Crush Sand", quantity: "11 Trips", time: "2 hrs ago", status: "rejected", siteLocation: "Vishrambag,Sangli,Maharashtra" },
  { id: 2, customer: "Customer B", material: "Crush Sand", quantity: "11 Trips", time: "4 hrs ago", status: "confirmed", siteLocation: "Vishrambag, Sangli, Maharashtra" },
  { id: 3, customer: "Customer C", material: "Crush Sand", quantity: "5 Trips", time: "1 day ago", status: "fulfilled", siteLocation: "Vishrambag, Sangli, Maharashtra" },
  { id: 4, customer: "Customer D", material: "Crush Sand", quantity: "8 Trips", time: "2 days ago", status: "rejected", siteLocation: "Vishrambag, Sangli, Maharashtra" },
];

const SellerOrders = () => {
  const [orders, setOrders] = useState(initialOrders);

  const updateStatus = (id, newStatus) => {
    const updated = orders.map((order) =>
      order.id === id ? { ...order, status: newStatus } : order
    );
    setOrders(updated);
  };

  const openMaps = (location) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyLocation = async (location, id) => {
    try {
      await navigator.clipboard.writeText(location);
      setOrders((prev) => prev.map(o => o.id === id ? { ...o, copied: true } : o));
      setTimeout(() => {
        setOrders((prev) => prev.map(o => o.id === id ? { ...o, copied: false } : o));
      }, 1400);
    } catch {
      // ignore clipboard failures
    }
  };

  return (
    <div className="orders-layout">
      <Sidebar />
      <NotificationButton/>
      <div className="notification-scrollable"></div>
      <div className="orders-content">
        <h1>Supplier Orders</h1>

        {orders.length === 0 ? (
          <p className="no-orders">No orders available.</p>
        ) : (
          <ul className="orders-list">
            {orders.map((order) => (
              <li key={order.id} className={`order-item ${order.status}`}>
                <div className="order-top">
                  <div className="order-header">
                    <strong>{order.material}</strong> — {order.quantity}
                  </div>
                  <div className="order-meta">
                    <span className="meta-item">Customer: <strong>{order.customer}</strong></span>
                    <span className="meta-item">Placed: <strong>{order.time}</strong></span>
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-left">
                    <div className="order-status">
                      Status: <span className={`status-label ${order.status}`}>{order.status}</span>
                    </div>

                    <div className="site-row">
                      <button
                        type="button"
                        className="site-button"
                        onClick={() => openMaps(order.siteLocation)}
                        title={`Open ${order.siteLocation} in Google Maps`}
                      >
                        📍 {order.siteLocation}
                      </button>

                      <button
                        type="button"
                        className="site-copy"
                        onClick={() => copyLocation(order.siteLocation, order.id)}
                        aria-label={`Copy site location ${order.siteLocation}`}
                      >
                        {order.copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="order-actions">
                    {order.status === "pending" && (
                      <>
                        <button onClick={() => updateStatus(order.id, "confirmed")} className="confirm-btn">Confirm</button>
                        <button onClick={() => updateStatus(order.id, "rejected")} className="reject-btn">Reject</button>
                      </>
                    )}

                    {order.status === "confirmed" && (
                      <button onClick={() => updateStatus(order.id, "fulfilled")} className="fulfill-btn">Mark as Fulfilled</button>
                    )}

                    {/* Show small badges for final states */}
                    {order.status === "fulfilled" && <span className="badge fulfilled">Fulfilled</span>}
                    {order.status === "rejected" && <span className="badge rejected">Rejected</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;
