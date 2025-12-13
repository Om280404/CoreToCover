// File: src/components/SupplierNotifications.jsx
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "./Notifications.css";
import NotificationButton from "./NotificationButton";

const initialNotifications = [
  {
    id: 1,
    type: "Order",
    message: "Order of 8 trips Crush Sand placed by Customer A",
    time: "2 hrs ago",
    read: false,
    status: null,
    reason: "",
    siteLocation: "Vishrambag, Sangli, Maharashtra",
    totalTrips: 8,
    fulfilledTrips: 0,
    tempInput: "",
  },
  {
    id: 2,
    type: "Order",
    message: "Order of 11 trips Crush Sand placed by Customer B",
    time: "4 hrs ago",
    read: false,
    status: null,
    reason: "",
    siteLocation: "Vishrambag, Sangli, Maharashtra",
    totalTrips: 11,
    fulfilledTrips: 0,
    tempInput: "",
  },
];

const SellerNotifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const totalOrders = notifications.filter((n) => n.type === "Order").length;

  const openMaps = (location) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyLocation = async (location, id) => {
    try {
      await navigator.clipboard.writeText(location);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, copied: true } : n)));
      setTimeout(() => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, copied: false } : n)));
      }, 1400);
    } catch {
      // ignore
    }
  };

  const confirmOrder = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, status: "confirming", read: true, tempInput: "" } : n
      )
    );
  };

  const submitConfirmation = (id) => {
    setNotifications((prev) => {
      const updated = prev
        .map((n) => {
          if (n.id !== id) return n;
          const raw = n.tempInput;
          const parsed = Number(raw);
          if (!Number.isFinite(parsed) || parsed < 0) {
            alert("Please enter a valid non-negative number of trips.");
            return n;
          }
          const toAdd = Math.floor(parsed);
          const remaining = (n.totalTrips || 0) - (n.fulfilledTrips || 0);
          if (remaining <= 0) {
            return { ...n, fulfilledTrips: n.totalTrips || n.fulfilledTrips, status: "fulfilled", tempInput: "" };
          }
          const actuallyAdded = Math.min(toAdd, remaining);
          const newFulfilled = (n.fulfilledTrips || 0) + actuallyAdded;
          const newStatus = newFulfilled >= (n.totalTrips || 0) ? "fulfilled" : "confirmed";
          return { ...n, fulfilledTrips: newFulfilled, status: newStatus, tempInput: "" };
        })
        // after mapping, remove any that reached fulfilled
        .filter((n) => n.status !== "fulfilled");
      return updated;
    });
  };

  const addMoreTrips = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: "confirming", tempInput: "" } : n)));
  };

  const cancelConfirmFlow = (id) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const wasConfirmed = (n.fulfilledTrips || 0) > 0;
        return { ...n, status: wasConfirmed ? "confirmed" : null, tempInput: "" };
      })
    );
  };

  const rejectOrder = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: "rejecting", tempInput: "" } : n)));
  };

  const submitRejection = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "rejected", read: true } : n))
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 1000);
  };

  const fulfillOrderFully = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, status: "fulfilled", fulfilledTrips: n.totalTrips || n.fulfilledTrips || 0, read: true } : n
      )
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 1000);
  };

  const handleTempInputChange = (id, value) => {
    if (value === "" || /^(\d+)?$/.test(value)) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, tempInput: value } : n)));
    }
  };

  return (
    <div className="notifications-layout">
      <Sidebar />
      <NotificationButton notificationCount={totalOrders} />

      <div className="notifications-scrollable">
        <div className="notifications-content">
          <div className="notifications-header">
            <h1>Notifications</h1>
          </div>

          {notifications.length === 0 ? (
            <p className="no-notifications">No notifications yet.</p>
          ) : (
            <ul className="notifications-list">
              {notifications.map((item) => {
                const remaining = (item.totalTrips || 0) - (item.fulfilledTrips || 0);
                return (
                  <li key={item.id} className={`notification-item ${item.read ? "read" : "unread"}`}>
                    <div className="notification-main">
                      <div className="notification-type">{item.type}</div>
                      <div className="notification-message">{item.message}</div>
                      <div className="notification-time">{item.time}</div>

                      <div className="notification-site-row">
                        <button
                          type="button"
                          className="site-button"
                          onClick={() => openMaps(item.siteLocation)}
                          title={`Open ${item.siteLocation} in Google Maps`}
                        >
                          📍 {item.siteLocation}
                        </button>

                        <button
                          type="button"
                          className="site-copy"
                          onClick={() => copyLocation(item.siteLocation, item.id)}
                          aria-label={`Copy site location ${item.siteLocation}`}
                        >
                          {item.copied ? "Copied" : "Copy"}
                        </button>
                      </div>

                      {item.type === "Order" && (
                        <div className="trips-info">
                          <strong>Trips fulfilled:</strong> {item.fulfilledTrips || 0} / {item.totalTrips || "—"}
                          {remaining > 0 && <span className="trips-remaining"> • {remaining} remaining</span>}
                        </div>
                      )}
                    </div>

                    {item.type === "Order" && (
                      <div className="notification-actions">
                        {item.status === "confirming" && remaining > 0 ? (
                          <div className="confirm-flow">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={item.tempInput ?? ""}
                              onChange={(e) => handleTempInputChange(item.id, e.target.value)}
                              className="confirm-input"
                              placeholder={`0 - ${item.totalTrips || ""}`}
                            />
                            <button
                              className="action-btn confirm-save"
                              onClick={() => submitConfirmation(item.id)}
                              disabled={item.tempInput === "" || Number(item.tempInput) < 0}
                            >
                              Save
                            </button>
                            <button className="action-btn confirm-cancel" onClick={() => cancelConfirmFlow(item.id)}>
                              Cancel
                            </button>
                          </div>
                        ) : null}

                        {item.status === null && remaining > 0 && (
                          <>
                            <button className="action-btn confirm-order-btn" onClick={() => confirmOrder(item.id)}>
                              Confirm
                            </button>
                            <button className="action-btn reject-order-btn" onClick={() => rejectOrder(item.id)}>
                              Reject
                            </button>
                          </>
                        )}

                        {item.status === "confirmed" && remaining > 0 && (
                          <>
                            <span className="status-chip order-confirmed">✅ Order Confirmed</span>
                            <button className="action-btn add-more-btn" onClick={() => addMoreTrips(item.id)}>
                              Add Fulfilled Trips
                            </button>
                            <button className="action-btn fulfill-full-btn" onClick={() => fulfillOrderFully(item.id)}>
                              Fulfill Remaining
                            </button>
                          </>
                        )}

                        {item.status === "rejecting" && (
                          <div className="rejection-form">
                            <textarea
                              placeholder="Enter rejection reason..."
                              value={item.reason}
                              onChange={(e) => {
                                const updated = notifications.map((n) =>
                                  n.id === item.id ? { ...n, reason: e.target.value } : n
                                );
                                setNotifications(updated);
                              }}
                            />
                            <button
                              className="submit-reject-btn"
                              onClick={() => submitRejection(item.id)}
                              disabled={!item.reason?.trim()}
                            >
                              Submit
                            </button>
                          </div>
                        )}

                        {item.status === "rejected" && (
                          <div className="order-rejected">
                            <span className="status-chip order-rejected">Order Rejected</span>
                            <p className="reject-reason">Reason: {item.reason}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerNotifications;
