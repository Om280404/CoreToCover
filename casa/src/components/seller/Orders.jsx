// File: src/components/SupplierOrders.jsx
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import NotificationButton from "./NotificationButton";
import "./Orders.css";

/*
  SupplierOrders.jsx
  - Frontend-only mock data
  - Content aligned with Home Interior / Furniture sellers
  - Class names & layout unchanged
*/

const initialOrders = [
  {
    id: 1,
    customer: "Aarav Mehta",
    material: "Luxury Velvet Sofa",
    quantity: "1 Piece",
    time: "2 hrs ago",
    status: "pending",
    siteLocation: "Baner, Pune, Maharashtra",
  },
  {
    id: 2,
    customer: "Neha Kulkarni",
    material: "Royal Accent Chair",
    quantity: "2 Pieces",
    time: "5 hrs ago",
    status: "confirmed",
    siteLocation: "Vishrambag, Sangli, Maharashtra",
  },
  {
    id: 3,
    customer: "Rohan Patil",
    material: "Modern Leather Sofa Set",
    quantity: "1 Set",
    time: "1 day ago",
    status: "fulfilled",
    siteLocation: "Kolhapur, Maharashtra",
  },
  {
    id: 4,
    customer: "Sneha Deshmukh",
    material: "Designer Lounge Chair",
    quantity: "1 Piece",
    time: "2 days ago",
    status: "rejected",
    siteLocation: "Satara, Maharashtra",
  },
];

const SupplierOrders = () => {
  const [orders, setOrders] = useState(initialOrders);

  const updateStatus = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const openMaps = (location) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      location
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyLocation = async (location, id) => {
    try {
      await navigator.clipboard.writeText(location);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, copied: true } : o
        )
      );
      setTimeout(() => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === id ? { ...o, copied: false } : o
          )
        );
      }, 1400);
    } catch {
      // silent fail
    }
  };

  return (
    <div className="orders-layout">
      <Sidebar />
      <NotificationButton />
      <div className="notification-scrollable"></div>

      <div className="orders-content">
        <h1>Customer Orders</h1>

        {orders.length === 0 ? (
          <p className="no-orders">No orders received yet.</p>
        ) : (
          <ul className="orders-list">
            {orders.map((order) => (
              <li key={order.id} className={`order-item ${order.status}`}>
                <div className="order-top">
                  <div className="order-header">
                    <strong>{order.material}</strong> — {order.quantity}
                  </div>

                  <div className="order-meta">
                    <span className="meta-item">
                      Customer: <strong>{order.customer}</strong>
                    </span>
                    <span className="meta-item">
                      Order Placed: <strong>{order.time}</strong>
                    </span>
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-left">
                    <div className="order-status">
                      Status:{" "}
                      <span className={`status-label ${order.status}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="site-row">
                      <button
                        type="button"
                        className="site-button"
                        onClick={() => openMaps(order.siteLocation)}
                        title={`Open delivery location in Google Maps`}
                      >
                        📍 {order.siteLocation}
                      </button>

                      <button
                        type="button"
                        className="site-copy"
                        onClick={() =>
                          copyLocation(order.siteLocation, order.id)
                        }
                      >
                        {order.copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="order-actions">
                    {order.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            updateStatus(order.id, "confirmed")
                          }
                          className="confirm-btn"
                        >
                          Accept Order
                        </button>
                        <button
                          onClick={() =>
                            updateStatus(order.id, "rejected")
                          }
                          className="reject-btn"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {order.status === "confirmed" && (
                      <button
                        onClick={() =>
                          updateStatus(order.id, "fulfilled")
                        }
                        className="fulfill-btn"
                      >
                        Mark as Delivered
                      </button>
                    )}

                    {order.status === "fulfilled" && (
                      <span className="badge fulfilled">
                        Delivered
                      </span>
                    )}

                    {order.status === "rejected" && (
                      <span className="badge rejected">
                        Rejected
                      </span>
                    )}
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

export default SupplierOrders;
