import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import NotificationButton from "./NotificationButton";
import { useNavigate } from "react-router-dom";
import "./SellerBankDetails.css";

const SellerBankDetails = () => {
  const navigate = useNavigate();
  const sellerId = localStorage.getItem("sellerId");

  const [form, setForm] = useState({
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sellerId) return;

    setLoading(true);

    fetch(`http://localhost:3001/seller/${sellerId}/bank-details`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setForm(data);
      })
      .finally(() => setLoading(false));
  }, [sellerId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.accountHolder || !form.bankName || !form.accountNumber || !form.ifsc) {
      alert("Please fill all fields");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("http://localhost:3001/seller/bank-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, ...form }),
      });

      if (!res.ok) throw new Error();

      alert("Bank details saved successfully ✅");
      navigate("/sellerdashboard"); // ✅ navigate AFTER success
    } catch {
      alert("Failed to save bank details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bs-layout-root">

      <div className="bs-profile-shell">
        <h1 className="bs-heading">Bank Details</h1>

        {loading ? (
          <p>Loading…</p>
        ) : (
          <form className="bs-card bs-bank-form" onSubmit={handleSave}>
            <label>Account Holder Name
              <input name="accountHolder" value={form.accountHolder} onChange={handleChange} />
            </label>

            <label>Bank Name
              <input name="bankName" value={form.bankName} onChange={handleChange} />
            </label>

            <label>Account Number
              <input name="accountNumber" value={form.accountNumber} onChange={handleChange} />
            </label>

            <label>IFSC Code
              <input name="ifsc" value={form.ifsc} onChange={handleChange} />
            </label>

            <button className="bs-btn bs-btn--primary" disabled={saving}>
              {saving ? "Saving..." : "Save & Go to Dashboard"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SellerBankDetails;
