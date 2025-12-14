// File: src/components/seller/SellerLogin.jsx
import React, { useState } from "react";
import "./SellerLogin.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const SellerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/seller/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // ✅ CORRECT & REQUIRED
      localStorage.setItem("sellerId", data.seller.id);
      localStorage.setItem("sellerEmail", data.seller.email);
      localStorage.setItem("sellerProfile", JSON.stringify(data.seller));

      navigate("/sellerdashboard");
    } catch (err) {
      console.error("SELLER LOGIN ERROR:", err);
      alert("Server error during login");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="brand-heading">Casa</h2>
        <h4>Welcome back, Seller</h4>
        <p className="subtitle">Log in to manage your store</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="seller@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-fld">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle_btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <p className="signup-text">
            Don’t have a seller account?{" "}
            <Link to="/sellersignup">Sign up</Link>
          </p>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerLogin;
