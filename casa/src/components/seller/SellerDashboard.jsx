// File: src/components/seller/SellerDashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationButton from "./NotificationButton";
import "./SellerDashboard.css";
import { FaShoppingCart, FaRupeeSign } from "react-icons/fa";

const SellerDashboard = () => {
  const navigate = useNavigate();

  const sellerId = localStorage.getItem("sellerId");

  /* ===============================
     STATE
  =============================== */
  const [seller, setSeller] = useState({
    name: "Seller",
  });

  const [ordersCount, setOrdersCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  /* ===============================
     LOAD SELLER PROFILE (LOCAL)
  =============================== */
  useEffect(() => {
    const sellerEmail = localStorage.getItem("sellerEmail");

    if (!sellerEmail || !sellerId) {
      alert("Please log in as a seller.");
      // navigate("/sellerlogin");
      return;
    }

    const storedProfile = JSON.parse(
      localStorage.getItem("sellerProfile")
    );

    setSeller({
      name: storedProfile?.name || "Seller",
    });
  }, [navigate, sellerId]);

  /* ===============================
     FETCH DASHBOARD STATS
  =============================== */
  useEffect(() => {
    if (!sellerId) return;

    fetch(`http://localhost:3001/seller/${sellerId}/orders`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        // ✅ Orders received
        setOrdersCount(data.length);

        // ✅ Earnings from fulfilled orders only
        const earnings = data
          .filter((o) => o.status === "fulfilled")
          .reduce((sum, o) => {
            const amount = Number(o.totalAmount || 0);
            return sum + amount;
          }, 0);

        setTotalEarnings(earnings);
      })
      .catch((err) => {
        console.error("DASHBOARD FETCH ERROR:", err);
      });
  }, [sellerId]);

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <NotificationButton />

      <div className="dashboard-main">
        <h1 className="dashboard-title">
          Welcome, {seller.name}
        </h1>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <FaShoppingCart className="dashboard-icon" />
            <p className="dashboard-label">Orders Received</p>
            <h2 className="dashboard-value">
              {ordersCount}
            </h2>
          </div>

          <div className="dashboard-card">
            <FaRupeeSign className="dashboard-icon" />
            <p className="dashboard-label">Total Earnings</p>
            <h2 className="dashboard-value">
              ₹{totalEarnings.toLocaleString()}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
