// File: src/components/customer/MyOrders.jsx
import React, { useState, useMemo, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import "./MyOrders.css";
import sample from "../../assets/images/sample.jpg";
import api from "../../api/axios";
import { cancelOrder } from "../../api/order";
import { GiSandsOfTime } from "react-icons/gi";


/* =========================
   🔹 RETURN APIs
========================= */
import {
  requestReturn,
  getUserReturns,
  getUserCredit, // ✅ NEW
} from "../../api/return";

/* =========================
   ORDER STATUS META
========================= */
const getOrderStatusMeta = (status) => {
  switch (status) {
    case "pending":
      return { text: "Processing", className: "status-processing" };

    case "confirmed":
      return { text: "Confirmed", className: "status-confirmed" };

    case "out_for_delivery":
      return { text: "Out for Delivery", className: "status-out-for-delivery" };

    case "fulfilled":
      return { text: "Delivered", className: "status-delivered" };

    case "rejected":
      return { text: "Rejected", className: "status-cancelled" };

    case "cancelled":
      return { text: "Cancelled", className: "status-cancelled" };

    default:
      return { text: "Processing", className: "status-processing" };
  }
};


const getFinalOrderStatus = (orderStatus, returnInfo) => {
  if (!returnInfo) return getOrderStatusMeta(orderStatus);

  switch (returnInfo.status) {
    case "REQUESTED":
      return {
        text: "Return Requested",
        className: "status-return-requested",
      };

    case "APPROVED":
      return {
        text:
          returnInfo.refundMethod === "STORE_CREDIT"
            ? "Returned (Store Credit)"
            : "Returned (Refund Processing)",
        className: "status-returned",
      };


    case "REJECTED":
      return {
        text: "Return Rejected",
        className: "status-return-rejected",
      };

    default:
      return getOrderStatusMeta(orderStatus);
  }
};


/* =========================
   RETURN REASONS
========================= */
const RETURN_REASONS = [
  "Damaged or defective product",
  "Wrong item delivered",
  "Product not as described",
];

/* =========================
   RETURN WINDOW (2 DAYS)
========================= */
const RETURN_LIMIT_DAYS = 2;
const MS_IN_DAY = 1000 * 60 * 60 * 24;

export default function MyOrders() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [ratings, setRatings] = useState({});
  const [reviews, setReviews] = useState({});
  const [openRating, setOpenRating] = useState({});

  /* =========================
     🔹 RETURN STATE
  ========================= */
  const [returnsMap, setReturnsMap] = useState({});
  const [returnLoading, setReturnLoading] = useState(null);
  const [returnReason, setReturnReason] = useState({});
  const [openReturnBox, setOpenReturnBox] = useState({});
  const [returnImages, setReturnImages] = useState({});
  const [refundMethod, setRefundMethod] = useState({});



  /* =========================
     🔹 CREDIT STATE (NEW)
  ========================= */
  const [credit, setCredit] = useState(0);

  const userEmail = localStorage.getItem("userEmail");

  const canCancelOrder = (order) => {
    // ❌ Cannot cancel once out for delivery or delivered
    if (
      order.orderStatus !== "confirmed" ||
      order.orderStatus === "out_for_delivery"
    ) {
      return false;
    }

    const orderDate = new Date(order.createdAt);
    const diffDays = (Date.now() - orderDate.getTime()) / MS_IN_DAY;

    return diffDays <= RETURN_LIMIT_DAYS;
  };


  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await cancelOrder(orderId);

      // ✅ Update UI immediately
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, orderStatus: "rejected" }
            : o
        )

      );


      alert("Order cancelled successfully");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to cancel order");
    }
  };



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
     FETCH USER RETURNS
  ========================= */
  useEffect(() => {
    if (!userEmail) return;

    getUserReturns()
      .then((res) => {
        const map = {};
        (res.data.returns || []).forEach((r) => {
          map[r.orderItemId] = r;
        });
        setReturnsMap(map);

        // If any of the user's returns are APPROVED, refresh credit.
        const anyApproved = (res.data.returns || []).some((r) => r.status === "APPROVED");
        if (anyApproved) {
          getUserCredit().then((cRes) => setCredit(Number(cRes.data.credit || 0))).catch(() => { });
        }
      })
      .catch(() => { });
  }, [userEmail]);


  /* =========================
     🔹 FETCH USER CREDIT (NEW)
  ========================= */
  useEffect(() => {
    getUserCredit()
      .then((res) => setCredit(res.data.credit || 0))
      .catch(() => { });
  }, []);

  /* =========================
     SUBMIT RATING (UNCHANGED)
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

      setOrders((prev) =>
        prev.map((o) =>
          o.orderItemId === orderItemId ? { ...o, isRated: true } : o
        )
      );

      setOpenRating((p) => ({ ...p, [orderItemId]: false }));
      alert("Thank you for your review ⭐");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit rating");
    }
  };

  /* =========================
     REQUEST RETURN (2-DAY LIMIT)
  ========================= */
  const handleReturnSubmit = async (order) => {
    const reason = returnReason[order.orderItemId];
    const method = refundMethod[order.orderItemId];

    if (!reason) {
      alert("Please select a return reason");
      return;
    }

    if (!method) {
      alert("Please select refund preference");
      return;
    }

    // ✅ 2-day limit
    const orderDate = new Date(order.createdAt);
    const diffDays = (Date.now() - orderDate.getTime()) / MS_IN_DAY;
    if (diffDays > RETURN_LIMIT_DAYS) {
      alert("Return period expired (2 days limit)");
      return;
    }

    const formData = new FormData();
    formData.append("orderItemId", order.orderItemId);
    formData.append("reason", reason);
    formData.append("refundMethod", method);


    (returnImages[order.orderItemId] || []).forEach((file) => {
      formData.append("images", file);
    });

    setReturnLoading(order.orderItemId);

    try {
      const res = await requestReturn(formData);

      setReturnsMap((prev) => ({
        ...prev,
        [order.orderItemId]: res.data.returnRequest,
      }));

      setOpenReturnBox((p) => ({ ...p, [order.orderItemId]: false }));
      alert("Return request submitted");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to request return");
    } finally {
      setReturnLoading(null);
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
      {/* =========================
          🔹 CREDIT DISPLAY (STYLED)
      ========================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2 className="orders-title">Your Orders</h2>
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1000,
            background: " #FFFFFF",
            color: "#606E52",
            padding: "10px 16px",
            borderRadius: 999,
            fontWeight: 600,
            border: "1px solid #bae6fd",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          Store Credit: ₹{credit}
        </div>

      </div>

      <input
        className="order-search"
        placeholder="Search your orders..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="orders-lists">
        {filteredOrders.map((order) => {
          const returnInfo = returnsMap[order.orderItemId];

          const statusMeta = getFinalOrderStatus(
            order.orderStatus,
            returnInfo
          );

          const isDelivered = order.orderStatus === "fulfilled";

          return (
            <article key={order.orderItemId} className="order-card">
              <img
                src={
                  order.imageUrl
                    ? `http://localhost:3001/${order.imageUrl}`
                    : sample
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
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Seller:</strong> {order.sellerName}</p>
                  <p><strong>Quantity:</strong> {order.quantity}</p>
                  <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                </div>

                {/* ===== CANCEL ORDER BUTTON ===== */}
                {canCancelOrder(order) && (
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    Cancel Order
                  </button>
                )}


                {/* ===== RETURN SECTION (ADDED SAFELY) ===== */}
                {isDelivered && (
                  <>
                    {/* ✅ RETURN ALREADY REQUESTED / PROCESSED */}
                    {returnInfo ? (
                      <div className="rated-pill">
                        {returnInfo.status === "REQUESTED" && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              color: "#92400e",
                              fontWeight: 500,
                            }}
                          >
                            Return requested
                            <GiSandsOfTime size={18} />
                          </span>
                        )}



                        {returnInfo.status === "APPROVED" && (
                          <span style={{ color: "#047857" }}>
                            Return approved ✅ Credit added
                          </span>
                        )}

                        {returnInfo.status === "REJECTED" && (
                          <span style={{ color: "#b91c1c" }}>
                            Return rejected
                          </span>
                        )}
                      </div>
                    ) : openReturnBox[order.orderItemId] ? (
                      /* ✅ REQUEST FORM */
                      <div className="order-rating">
                        <select
                          className="order-review"
                          value={returnReason[order.orderItemId] || ""}
                          onChange={(e) =>
                            setReturnReason((p) => ({
                              ...p,
                              [order.orderItemId]: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select return reason</option>
                          {RETURN_REASONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        {/* ===== REFUND METHOD ===== */}
                        <div className="refund-method">
                          <label>
                            <input
                              type="radio"
                              name={`refund-${order.orderItemId}`}
                              value="STORE_CREDIT"
                              checked={refundMethod[order.orderItemId] === "STORE_CREDIT"}
                              onChange={() =>
                                setRefundMethod((p) => ({
                                  ...p,
                                  [order.orderItemId]: "STORE_CREDIT",
                                }))
                              }
                            />
                            Store Credit (Instant)
                          </label>

                          <label style={{ marginLeft: 12 }}>
                            <input
                              type="radio"
                              name={`refund-${order.orderItemId}`}
                              value="ORIGINAL_PAYMENT"
                              checked={refundMethod[order.orderItemId] === "ORIGINAL_PAYMENT"}
                              onChange={() =>
                                setRefundMethod((p) => ({
                                  ...p,
                                  [order.orderItemId]: "ORIGINAL_PAYMENT",
                                }))
                              }
                            />
                            Original Payment
                          </label>
                        </div>


                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="order-review"
                          onChange={(e) =>
                            setReturnImages((p) => ({
                              ...p,
                              [order.orderItemId]: Array.from(e.target.files),
                            }))
                          }
                        />

                        <button
                          className="track-btn"
                          disabled={returnLoading === order.orderItemId}
                          onClick={() => handleReturnSubmit(order)}
                        >
                          {returnLoading === order.orderItemId
                            ? "Submitting..."
                            : "Confirm Return"}
                        </button>
                      </div>
                    ) : (
                      /* ✅ REQUEST BUTTON (ONLY IF NO RETURN EXISTS) */
                      <button
                        className="track-btn"
                        onClick={() =>
                          setOpenReturnBox((p) => ({
                            ...p,
                            [order.orderItemId]: true,
                          }))
                        }
                      >
                        Request Return
                      </button>
                    )}
                  </>
                )}


                {/* ===== RATING SECTION (UNCHANGED) ===== */}
                {isDelivered && (
                  <>
                    {order.isRated ? (
                      <span className="rated-pill">✓ Rated</span>
                    ) : openRating[order.orderItemId] ? (
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
