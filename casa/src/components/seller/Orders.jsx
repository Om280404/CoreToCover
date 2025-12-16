// File: src/components/SupplierOrders.jsx

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import NotificationButton from "./NotificationButton";
import "./Orders.css";
import {
  getSellerOrders,
  updateSellerOrderStatus,
} from "../../api/seller";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [confirmingAll, setConfirmingAll] = useState(false);
  const [deliveringAll, setDeliveringAll] = useState(false);
  const sellerId = localStorage.getItem("sellerId");

  /* =========================
     FETCH SELLER ORDERS
  ========================= */
  useEffect(() => {
    if (!sellerId) return;

    const loadOrders = async () => {
      try {
        const res = await getSellerOrders(sellerId);
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      }
    };

    loadOrders();
  }, [sellerId]);

  /* =========================
     UPDATE SINGLE ORDER STATUS
  ========================= */
  const updateStatus = async (orderItemId, newStatus) => {
    try {
      await updateSellerOrderStatus(orderItemId, newStatus);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderItemId ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  /* =========================
     ACCEPT ALL PENDING
  ========================= */
  const confirmAllOrders = async () => {
    const pendingOrders = orders.filter(
      (o) => o.status === "pending"
    );

    if (pendingOrders.length === 0) return;

    if (
      !window.confirm(
        `Accept all ${pendingOrders.length} pending orders?`
      )
    )
      return;

    try {
      setConfirmingAll(true);

      await Promise.all(
        pendingOrders.map((order) =>
          updateSellerOrderStatus(order.id, "confirmed")
        )
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.status === "pending"
            ? { ...o, status: "confirmed" }
            : o
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to accept all orders");
    } finally {
      setConfirmingAll(false);
    }
  };

  /* =========================
     MARK ALL AS DELIVERED
  ========================= */
  const deliverAllOrders = async () => {
    const confirmedOrders = orders.filter(
      (o) => o.status === "confirmed"
    );

    if (confirmedOrders.length === 0) return;

    if (
      !window.confirm(
        `Mark all ${confirmedOrders.length} confirmed orders as delivered?`
      )
    )
      return;

    try {
      setDeliveringAll(true);

      await Promise.all(
        confirmedOrders.map((order) =>
          updateSellerOrderStatus(order.id, "fulfilled")
        )
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.status === "confirmed"
            ? { ...o, status: "fulfilled" }
            : o
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to mark all as delivered");
    } finally {
      setDeliveringAll(false);
    }
  };

  /* =========================
     HELPERS
  ========================= */
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
      }, 1200);
    } catch {}
  };

  const hasPendingOrders = orders.some(
    (o) => o.status === "pending"
  );
  const hasConfirmedOrders = orders.some(
    (o) => o.status === "confirmed"
  );

  /* =========================
     UI
  ========================= */
  return (
    <div className="orders-layout">
      <Sidebar />
      <NotificationButton />
      <div className="notification-scrollable"></div>

      <div className="orders-content">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <h1>Customer Orders</h1>

          <div style={{ display: "flex", gap: "8px" }}>
            {hasPendingOrders && (
              <button
                className="confirm-btn"
                onClick={confirmAllOrders}
                disabled={confirmingAll}
              >
                {confirmingAll ? "Accepting..." : "Accept All"}
              </button>
            )}

            {hasConfirmedOrders && (
              <button
                className="fulfill-btn"
                onClick={deliverAllOrders}
                disabled={deliveringAll}
              >
                {deliveringAll
                  ? "Delivering..."
                  : "Mark All Delivered"}
              </button>
            )}
          </div>
        </div>

        {orders.length === 0 ? (
          <p className="no-orders">No orders received yet.</p>
        ) : (
          <ul className="orders-list">
            {orders.map((order) => (
              <li
                key={order.id}
                className={`order-item ${order.status}`}
              >
                <div className="order-top">
                  <div className="order-header">
                    <strong>{order.material}</strong> —{" "}
                    {order.quantity}
                  </div>

                  <div className="order-meta">
                    <span className="meta-item">
                      Customer:{" "}
                      <strong>{order.customer}</strong>
                    </span>
                    <span className="meta-item">
                      Order Placed:{" "}
                      <strong>
                        {new Date(order.time).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-left">
                    <div className="order-status">
                      Status:{" "}
                      <span
                        className={`status-label ${order.status}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="site-row">
                      <button
                        type="button"
                        className="site-button"
                        onClick={() =>
                          openMaps(order.siteLocation)
                        }
                      >
                        📍 {order.siteLocation}
                      </button>

                      <button
                        type="button"
                        className="site-copy"
                        onClick={() =>
                          copyLocation(
                            order.siteLocation,
                            order.id
                          )
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
                            updateStatus(
                              order.id,
                              "confirmed"
                            )
                          }
                          className="confirm-btn"
                        >
                          Accept Order
                        </button>
                        <button
                          onClick={() =>
                            updateStatus(
                              order.id,
                              "rejected"
                            )
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
                          updateStatus(
                            order.id,
                            "fulfilled"
                          )
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

export default SellerOrders;
