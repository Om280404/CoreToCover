// File: src/components/seller/SellerDashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationButton from "./NotificationButton";
import "./SellerDashboard.css";
import { FaShoppingCart, FaRupeeSign } from "react-icons/fa";
import {
  getSellerProfile,
  getSellerOrders,
} from "../../api/seller";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const sellerId = localStorage.getItem("sellerId");

  /* ===============================
     STATE
  =============================== */
  const [sellerName, setSellerName] = useState("Seller");
  const [ordersCount, setOrdersCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ===============================
     AUTH GUARD
  =============================== */
  useEffect(() => {
    if (!sellerId) {
      navigate("/sellerlogin");
    }
  }, [sellerId, navigate]);

  /* ===============================
     LOAD SELLER PROFILE
  =============================== */
  useEffect(() => {
    if (!sellerId) return;

    const loadProfile = async () => {
      try {
        const res = await getSellerProfile(sellerId);
        setSellerName(res.data.name || "Seller");
      } catch {
        setSellerName("Seller");
      }
    };

    loadProfile();
  }, [sellerId]);

  /* ===============================
     LOAD DASHBOARD STATS
  =============================== */
  useEffect(() => {
    if (!sellerId) return;

    const loadStats = async () => {
      try {
        const res = await getSellerOrders(sellerId);
        const orders = Array.isArray(res.data) ? res.data : [];

        setOrdersCount(orders.length);

        const earnings = orders
          .filter((o) => o.status === "fulfilled")
          .reduce(
            (sum, o) => sum + Number(o.totalAmount || 0),
            0
          );

        setTotalEarnings(earnings);
      } catch (err) {
        console.error("DASHBOARD ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar />
        <div className="dashboard-main">
          <h2>Loading dashboard…</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <NotificationButton />

      <div className="dashboard-main">
        <h1 className="dashboard-title">
          Welcome, {sellerName}
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
