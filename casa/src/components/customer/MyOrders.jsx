import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MyOrders.css";
import sample from "../../assets/images/sample.jpg";

const getOrderStatusText = (status) => {
  switch (status) {
    case "PROCESSING":
      return { text: "Processing", cancellable: true };
    case "DELIVERED":
    case "FULFILLED":
      return { text: "Delivered", cancellable: false };
    case "CANCELLED":
      return { text: "Cancelled", cancellable: false };
    default:
      return { text: "Processing", cancellable: false };
  }
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState([]);

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) return;

    fetch(`http://localhost:3001/orders/user/${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]));
  }, [userEmail]);

  const cancelOrder = async (orderId) => {
    const confirm = window.confirm("Cancel this order?");
    if (!confirm) return;

    const res = await fetch(
      `http://localhost:3001/order/${orderId.replace("ORD-", "")}/cancel`,
      { method: "PATCH" }
    );

    if (!res.ok) {
      alert("Failed to cancel order");
      return;
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, orderStatus: "CANCELLED" }
          : o
      )
    );
  };

  const filtered = useMemo(() => {
    return orders.filter((o) =>
      (o.productName || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [orders, query]);

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

          return (
            <article key={order.id} className="order-card">
              <img
                src={
                  order.imageUrl
                    ? `http://localhost:3001/${order.imageUrl}`
                    : sample
                }
                className="order-img"
              />

              <div className="order-info">
                <div className="order-header">
                  <h3 className="order-name">{order.productName}</h3>
                  <p className="order-status">{statusInfo.text}</p>
                </div>

                <div className="order-meta">
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Seller:</strong> {order.sellerName}</p>
                  <p><strong>Quantity:</strong> {order.quantity}</p>
                  <p>
                    <strong>Total:</strong> ₹
                    {Number(order.totalAmount).toLocaleString()}
                  </p>
                </div>

                <div className="order-actions">
                  {statusInfo.cancellable && (
                    <button
                      className="track-btn"
                      onClick={() => cancelOrder(order.id)}
                    >
                      Cancel Order
                    </button>
                  )}

                  <button
                    className="track-btn"
                    onClick={() =>
                      navigate("/orderstatus", { state: { order } })
                    }
                  >
                    Track Order
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="end-text">End of list</p>
    </div>
  );
}
