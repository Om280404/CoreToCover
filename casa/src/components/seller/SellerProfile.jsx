import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SellerProfile.css";
import Sidebar from "./Sidebar";
import NotificationButton from "./NotificationButton";

const SellerProfile = () => {
  const navigate = useNavigate();
  const sellerId = localStorage.getItem("sellerId");

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =========================
     FETCH SELLER PROFILE
  ========================= */
  useEffect(() => {
    if (!sellerId) {
      navigate("/sellerlogin");
      return;
    }

    fetch(`http://localhost:3001/seller/profile/${sellerId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [sellerId, navigate]);

  /* =========================
     SAVE PROFILE
  ========================= */
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Name and phone are required");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(
        `http://localhost:3001/seller/profile/${sellerId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
          }),
        }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();

      setProfile({
        ...profile,
        name: data.seller.name,
        phone: data.seller.phone,
      });

      setIsEditing(false);
      alert("Profile updated successfully ✅");
    } catch {
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/sellerlogin");
  };

  if (loading) {
    return (
      <div className="bs-layout-root">
        <Sidebar />
        <NotificationButton />
        <div className="bs-profile-shell">
          <h2>Loading profile…</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bs-layout-root">
      <Sidebar />
      <NotificationButton />

      <div className="bs-profile-shell">
        <h1 className="bs-heading">Seller Profile</h1>

        {!isEditing ? (
          <div className="bs-card">
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
            <p><strong>Location:</strong> {profile.location}</p>

            <button className="bs-btn bs-btn--primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
            <button className="bs-btn bs-btn--ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <form
            className="bs-edit-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {["name", "email", "phone"].map((field) => (
              <input
                key={field}
                name={field}
                value={formData[field]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                disabled={field === "email"}
              />
            ))}

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
