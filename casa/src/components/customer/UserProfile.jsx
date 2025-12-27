// File: src/components/UserProfile.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";
import Navbar from "./Navbar";
import MyOrders from "./MyOrders";

const UserProfile = () => {
  const navigate = useNavigate();

  /* ==============================
     LOGOUT & NAVIGATION
  ============================== */
  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userProfile");
    alert("You have been logged out.");
    navigate("/");
  };

  const handleBack = () => {
    navigate(-1);
  };

  /* ==============================
     LOAD USER (FRONTEND ONLY)
  ============================== */
  const storedProfile = JSON.parse(
    localStorage.getItem("userProfile")
  );

  const [user, setUser] = useState({
    name: storedProfile?.name || "Guest User",
    email:
      storedProfile?.email ||
      localStorage.getItem("userEmail") ||
      "",
    phone: storedProfile?.phone || "",
    address: storedProfile?.address || "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  /* ==============================
     HANDLERS
  ============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setUser(formData);
    localStorage.setItem(
      "userProfile",
      JSON.stringify(formData)
    );
    setIsEditing(false);
    alert("Profile saved locally.");
  };

  return (
    <>
      <Navbar />

      <div className="back-button-container">
        <button onClick={handleBack} className="back-button">
          ← Back
        </button>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          {isEditing ? (
            <>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="profile-input"
                placeholder="Enter name"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                className="profile-input"
                disabled
              />

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="profile-input"
                placeholder="Enter phone"
              />

              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="profile-input"
                placeholder="Enter address"
              />

              <button
                onClick={handleSave}
                className="profile-button save"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <div className="user-info">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone || "—"}</p>
                <p><strong>Address:</strong> {user.address || "—"}</p>
              </div>

              <hr />

              <div className="button-group">
                <button
                  onClick={() => setIsEditing(true)}
                  className="profile-button edit"
                >
                  Edit Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="profile-button logout"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="orders">
        <MyOrders />
      </div>
    </>
  );
};

export default UserProfile;
