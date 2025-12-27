// File: src/components/seller/SellerDashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationButton from "./NotificationButton";
import "./SellerDashboard.css";
import { FaShoppingCart, FaRupeeSign } from "react-icons/fa";

const SellerDashboard = () => {
  const navigate = useNavigate();

  /* ===============================
     SELLER DATA (FRONTEND ONLY)
  =============================== */
  const [seller, setSeller] = useState({
    name: "Seller",
  });

  useEffect(() => {
    const sellerEmail = localStorage.getItem("SellerEmail");

    if (!sellerEmail) {
      alert("Please log in as a seller.");
    //   navigate("/sellerlogin");
      return;
    }

    // Frontend-only local profile
    const storedProfile = JSON.parse(
      localStorage.getItem("sellerProfile")
    );

    setSeller({
      name: storedProfile?.name || "Seller",
    });
  }, [navigate]);

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
            <h2 className="dashboard-value">50</h2>
          </div>

          <div className="dashboard-card">
            <FaRupeeSign className="dashboard-icon" />
            <p className="dashboard-label">Total Earnings</p>
            <h2 className="dashboard-value">₹50,000</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
