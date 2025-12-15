// File: src/components/seller/SellerBusinessDetails.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BusinessDetails.css";

const BusinessDetails = () => {
  const navigate = useNavigate();

  const [business, setBusiness] = useState({
    businessName: "",
    sellerType: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gst: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBusiness({ ...business, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!business.businessName || !business.sellerType) {
      alert("Please fill all required fields.");
      return;
    }

    const sellerId = localStorage.getItem("SellerId");

    if (!sellerId) {
      alert("Seller not logged in. Please sign up again.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:3001/seller/business-details",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sellerId,
            businessName: business.businessName,
            sellerType: business.sellerType,
            address: business.address,
            city: business.city,
            state: business.state,
            pincode: business.pincode,
            gst: business.gst,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to save business details");
        return;
      }

      alert("Business details saved successfully");
      navigate("/sellerbankdetails");
    } catch (error) {
      console.error("Business details error:", error);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="business-container">
      <div className="business-card">
        <h2>Business Details</h2>
        <p>Tell us about what you sell</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Business / Store Name *</label>
            <input
              name="businessName"
              value={business.businessName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>What do you sell? *</label>
            <select
              name="sellerType"
              value={business.sellerType}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="interior-products">Interior Products</option>
              <option value="raw-materials">
                Raw Materials for Interior Products
              </option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="input-group">
            <label>Address</label>
            <input
              name="address"
              value={business.address}
              onChange={handleChange}
            />
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>City</label>
              <input
                name="city"
                value={business.city}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>State</label>
              <input
                name="state"
                value={business.state}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Pincode</label>
              <input
                name="pincode"
                value={business.pincode}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>GST (optional)</label>
              <input
                name="gst"
                value={business.gst}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Saving..." : "Finish & Go to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BusinessDetails;
