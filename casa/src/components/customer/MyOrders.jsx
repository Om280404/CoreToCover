// File: src/components/customer/MyOrders.jsx
import React, { useState, useMemo, useEffect } from "react";
import { FaStar, FaCheck } from "react-icons/fa";
import "./MyOrders.css";
import sample from "../../assets/images/sample.jpg";
import api from "../../api/axios";

/* =========================
   ORDER STATUS META
========================= */
const getOrderStatusMeta = (status) => {
  switch (status) {
    case "fulfilled":
      return { text: "Delivered", className: "status-delivered" };
    case "rejected":
      return { text: "Cancelled", className: "status-cancelled" };
    case "confirmed":
      return { text: "Confirmed", className: "status-confirmed" };
    default:
      return { text: "Processing", className: "status-processing" };
  }
};

export default function MyOrders() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [ratings, setRatings] = useState({});
  const [reviews, setReviews] = useState({});
  const [openRating, setOpenRating] = useState({});

  const userEmail = localStorage.getItem("userEmail");

  /* =========================
     FETCH USER ORDERS
  ========================= */
  useEffect(() => {
    if (!userEmail) return;

    api
      .get(`/orders/user/${encodeURIComponent(userEmail)}`)
      .then((res) => {
        setOrders(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setOrders([]));
  }, [userEmail]);

  /* =========================
     SUBMIT RATING
  ========================= */
  const submitRating = async (orderItemId) => {
    const stars = ratings[orderItemId];
    const comment = reviews[orderItemId] || "";

    if (!stars) {
      alert("Please select a rating");
      return;
    }

    try {
      await api.post(`/order/item/${orderItemId}/rate`, {
        stars,
        comment,
        userEmail,
      });

      // mark order as rated locally
      setOrders((prev) =>
        prev.map((o) =>
          o.orderItemId === orderItemId ? { ...o, isRated: true } : o
        )
      );

      setOpenRating((p) => ({
        ...p,
        [orderItemId]: false,
      }));

      alert("Thank you for your review ⭐");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit rating");
    }
  };

  /* =========================
     FILTER ORDERS
  ========================= */
  const filteredOrders = useMemo(() => {
    return orders.filter((o) =>
      (o.productName || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [orders, query]);

  /* =========================
     UI
  ========================= */
  return (
    <div className="orders-page">
      <div className="orders-header">
        <h2 className="orders-title">Your Orders</h2>
        <input
          className="order-search"
          placeholder="Search your orders..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="orders-list">
        {filteredOrders.map((order) => {
          const statusMeta = getOrderStatusMeta(order.orderStatus);
          const isDelivered = order.orderStatus === "fulfilled";

          return (
            <article key={order.orderItemId} className="order-card">
              <img
                src={
                  order.imageUrl ? `http://localhost:3001/${order.imageUrl}` : sample
                }
                className="order-img"
                alt={order.productName}
              />

              <div className="order-info">
                <div className="order-header">
                  <h3 className="order-name">{order.productName}</h3>
                  <span className={`order-status ${statusMeta.className}`}>
                    {statusMeta.text}
                  </span>
                </div>

                <div className="order-meta">
                  <p>
                    <strong>Order ID:</strong> {order.id}
                  </p>
                  <p>
                    <strong>Seller:</strong> {order.sellerName}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {order.quantity}
                  </p>
                  <p>
                    <strong>Total:</strong> ₹{order.totalAmount}
                  </p>
                </div>

                {/* DELIVERY DETAILS */}
                <div className="order-delivery">
                  <p>
                    <strong>Installation:</strong>{" "}
                    {order.installationAvailable === "yes"
                      ? `Available (₹${order.installationCharge ?? 0})`
                      : "Not available"}
                  </p>
                </div>

                {/* ===== RATING SECTION (CARD LEVEL) ===== */}
                {isDelivered && (
                  <>
                    {order.isRated ? (
                      /* ✅ SHOW RATED BADGE INSIDE CARD */
                      <span className="rated-pill">
                        ✓ Rated
                      </span>
                    ) : openRating[order.orderItemId] ? (
                      /* Rating form */
                      <div className="order-rating">
                        <div>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              size={18}
                              style={{ cursor: "pointer", marginRight: 4 }}
                              color={
                                (ratings[order.orderItemId] || 0) >= star
                                  ? "#facc15"
                                  : "#d1d5db"
                              }
                              onClick={() =>
                                setRatings((p) => ({
                                  ...p,
                                  [order.orderItemId]: star,
                                }))
                              }
                            />
                          ))}
                        </div>

                        <textarea
                          className="order-review"
                          placeholder="Write a review (optional)"
                          value={reviews[order.orderItemId] || ""}
                          onChange={(e) =>
                            setReviews((p) => ({
                              ...p,
                              [order.orderItemId]: e.target.value,
                            }))
                          }
                        />

                        <button
                          className="track-btn"
                          onClick={() => submitRating(order.orderItemId)}
                        >
                          Submit Review
                        </button>
                      </div>
                    ) : (
                      /* Show rate button only if NOT rated */
                      <button
                        className="rate-btn"
                        onClick={() =>
                          setOpenRating((p) => ({
                            ...p,
                            [order.orderItemId]: true,
                          }))
                        }
                      >
                        Rate Order
                      </button>
                    )}
                  </>
                )}

              </div>
            </article>
          );
        })}
      </div>

      <p className="end-text">End of list</p>
    </div>
  );
}
