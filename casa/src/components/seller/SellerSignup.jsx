// File: src/components/seller/SellerSignup.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./SellerSignup.css";
import { sellerSignup } from "../../api/sellerAuth";


const SellerSignup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.terms) {
      alert("You must accept the Terms & Conditions.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await sellerSignup({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      // ✅ Save sellerId for onboarding steps
      localStorage.setItem("sellerId", res.data.sellerId);
      localStorage.setItem("sellerEmail", form.email);

      // 🔔 notify app about auth change
      window.dispatchEvent(new Event("storage"));

      navigate("/businessdetails");
    } catch (err) {
      alert(
        err?.response?.data?.message ||
        "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="brand-heading">Casa</h1>
        <h2>Create Seller Account</h2>
        <p className="subtitle">Start selling on Casa</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input name="name" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input type="email" name="email" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Phone</label>
            <input name="phone" onChange={handleChange} required />
          </div>

          <div className="input-group password-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                onChange={handleChange}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="input-group password-group">
            <label>Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <label className="terms">
            <input type="checkbox" name="terms" onChange={handleChange} />
            I agree to the <Link to="/terms">Terms & Conditions</Link>
          </label>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Creating..." : "Continue"}
          </button>

          <p className="login-link">
            Already have an account? <Link to="/sellerlogin">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SellerSignup;
