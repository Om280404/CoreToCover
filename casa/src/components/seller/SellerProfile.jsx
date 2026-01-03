// File: src/components/seller/SellerProfile.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SellerProfile.css";
import Sample from "../../assets/images/sample.jpg";
import Sidebar from "./Sidebar";
import NotificationButton from "./NotificationButton";

/* =========================================
   MOCK DATA (FRONTEND ONLY)
========================================= */
const initialProfile = {
  name: "Demo Seller",
  email: localStorage.getItem("SellerEmail") || "seller@casa.com",
  phone: "9876543210",
  location: "Sangli, Maharashtra",
};


const SellerProfile = () => {
  const navigate = useNavigate();

  /* =========================================
     STATE
  ========================================= */
  const [profile, setProfile] = useState(
    JSON.parse(localStorage.getItem("sellerProfile")) || initialProfile
  );

  const [formData, setFormData] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);

  /* =========================================
     HANDLERS
  ========================================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setProfile(formData);
    localStorage.setItem(
      "sellerProfile",
      JSON.stringify(formData)
    );
    setIsEditing(false);
    alert("Profile saved locally.");
  };

  const handleLogout = () => {
    localStorage.removeItem("SellerEmail");
    localStorage.removeItem("sellerProfile");
    alert("Logged out successfully.");
    navigate("/sellerlogin");
  };

  /* =========================================
     RENDER
  ========================================= */
  return (
    <div className="bs-layout-root">
      <Sidebar />
      <NotificationButton />

      <div className="bs-profile-shell">
        <h1 className="bs-heading">Seller Profile</h1>

        {/* Rating */}
        <div className="bs-rating-row">
          <span className="bs-rating-label">Overall Rating</span>
          <div className="bs-rating-stars">
            {"★★★★★"}
            <span className="bs-rating-value">5.0</span>
          </div>
        </div>

        {/* PROFILE SECTION */}
        {!isEditing ? (
          <section className="bs-details-grid">
            <div className="bs-card bs-card--main">
              <div className="bs-field">
                <span className="bs-field-key">Name:</span>
                <span className="bs-field-val">{profile.name}</span>
              </div>

              <div className="bs-field">
                <span className="bs-field-key">Email:</span>
                <span className="bs-field-val">{profile.email}</span>
              </div>

              <div className="bs-field">
                <span className="bs-field-key">Phone:</span>
                <span className="bs-field-val">{profile.phone}</span>
              </div>

              <div className="bs-field">
                <span className="bs-field-key">Location:</span>
                <span className="bs-field-val">{profile.location}</span>
              </div>

              <div className="bs-actions-row">
                <button
                  className="bs-btn bs-btn--primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>

                <button
                  className="bs-btn bs-btn--ghost"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </section>
        ) : (
          <form
            className="bs-edit-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {["name", "email", "phone", "location"].map((field) => (
              <label key={field} className="bs-form-row">
                <span className="bs-form-label">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </span>
                <input
                  className="bs-input"
                  name={field}
                  value={formData[field] || ""}
                  onChange={handleChange}
                  disabled={field === "email"}
                />
              </label>
            ))}

            <div className="bs-edit-actions">
              <button type="submit" className="bs-btn bs-btn--primary">
                Save
              </button>
              <button
                type="button"
                className="bs-btn bs-btn--ghost"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
