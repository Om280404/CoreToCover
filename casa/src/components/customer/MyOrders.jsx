import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./MyOrders.css";
import sample from "../../assets/images/sample.jpg";
import { FaStar } from "react-icons/fa";

/* =========================================
   MOCK ORDERS
========================================= */
const MOCK_ORDERS = [
  {
    id: "ORD-1001",
    productName: "Premium Wooden Door",
    sellerName: "Om Interiors",
    quantity: 2,
    totalAmount: 37000,
    orderStatus: "DELIVERED",
    createdAt: "2025-01-12T10:30:00",
    imageUrl: null,
  },
  {
    id: "ORD-1002",
    productName: "Modular Kitchen Cabinet",
    sellerName: "Casa Furnish",
    quantity: 1,
    totalAmount: 45000,
    orderStatus: "PROCESSING",
    createdAt: "2025-01-15T14:00:00",
    imageUrl: null,
  },
];

/* =========================================
   STATUS FORMATTER
========================================= */
const getOrderStatusText = (status) => {
  switch (status) {
    case "PROCESSING":
      return { text: "Processing", delivered: false };
    case "DELIVERED":
      return { text: "Delivered", delivered: true };
    default:
      return { text: "Status Unknown", delivered: false };
  }
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [orders] = useState(MOCK_ORDERS);

  /* Rating modal state */
  const [showRating, setShowRating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const filtered = useMemo(() => {
    return orders.filter((o) =>
      o.productName.toLowerCase().includes(query.toLowerCase())
    );
  }, [orders, query]);

  const openRatingModal = (order) => {
    setSelectedOrder(order);
    setRating(0);
    setReview("");
    setShowRating(true);
  };

  const submitRating = () => {
    alert(
      `Rated ${selectedOrder.productName} with ${rating} stars\nReview: ${review || "No review"}`
    );
    setShowRating(false);
  };

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
        {filtered.map((order) => {
          const statusInfo = getOrderStatusText(order.orderStatus);
          const orderDate = new Date(order.createdAt).toLocaleDateString(
            "en-GB",
            { year: "numeric", month: "short", day: "numeric" }
          );
          const finalImage = order.imageUrl || sample;

          return (
            <article key={order.id} className="order-card">
              <img src={finalImage} alt="" className="order-img" />

              <div className="order-info">
                <div className="order-header">
                  <h3 className="order-name">{order.productName}</h3>
                  <p
                    className={`order-status ${
                      statusInfo.delivered ? "delivered" : "pending"
                    }`}
                  >
                    {statusInfo.text}
                  </p>
                </div>

                <div className="order-meta">
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Seller:</strong> {order.sellerName}</p>
                  <p><strong>Quantity:</strong> {order.quantity}</p>
                  <p><strong>Placed On:</strong> {orderDate}</p>
                  <p className="order-total">
                    <strong>Total:</strong> ₹{order.totalAmount.toLocaleString()}
                  </p>
                </div>

                <div className="order-actions">
                  <button
                    className="track-btn"
                    onClick={() =>
                      navigate("/orderstatus", { state: { order } })
                    }
                  >
                    Track Order
                  </button>

                  {statusInfo.delivered && (
                    <button
                      className="rate-btn"
                      onClick={() => openRatingModal(order)}
                    >
                      Rate Product
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="end-text">End of list</p>

      {/* ================= RATING MODAL ================= */}
      {showRating && (
        <div className="rating-overlay">
          <div className="rating-modal">
            <h3>Rate {selectedOrder.productName}</h3>

            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={star <= rating ? "star active" : "star"}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>

            <textarea
              placeholder="Write a review (optional)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />

            <div className="rating-actions">
              <button className="cancel-btn" onClick={() => setShowRating(false)}>Cancel</button>
              <button
                className="submit-btn"
                onClick={submitRating}
                disabled={rating === 0}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
