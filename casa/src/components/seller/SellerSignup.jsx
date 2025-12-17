import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  sendSellerOtp,
  verifySellerOtp,
  sellerSignup,
} from "../../api/auth";
import "./SellerSignup.css";

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

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const sendOtp = async () => {
    if (!form.phone) return alert("Enter phone number");
    await sendSellerOtp(form.phone);
    setOtpSent(true);
    alert("OTP sent");
  };

  const verifyOtp = async () => {
    await verifySellerOtp(form.phone, otp);
    setPhoneVerified(true);
    alert("Phone verified");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.terms) return alert("Accept terms");
    if (!phoneVerified) return alert("Verify phone");
    if (form.password !== form.confirmPassword)
      return alert("Passwords do not match");

    setLoading(true);

    try {
      const res = await sellerSignup({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      localStorage.setItem("sellerId", res.data.sellerId);
      window.dispatchEvent(new Event("storage"));

      navigate("/businessdetails");
    } catch (err) {
      alert(err?.response?.data?.message || "Signup failed");
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
          {/* Full Name */}
          <div className="input-group">
            <label>Full Name</label>
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div className="input-group">
            <label>Phone</label>
            <input
              name="phone"
              placeholder="Phone"
              onChange={handleChange}
              required
            />
          </div>

          {/* OTP Section */}
          <div className="otp-actions">
            <button
              className="otp-btn"
              type="button"
              onClick={sendOtp}
              disabled={otpSent}
            >
              {otpSent ? "OTP Sent" : "Send OTP"}
            </button>


            {otpSent && !phoneVerified && (
              <>
                <input
                  className="otp-btn primary"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  className="otp-btn"
                  type="button"
                  onClick={verifyOtp}
                >
                  Verify OTP
                </button>
              </>
            )}
          </div>

          {/* Password */}
          <div className="input-group password-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="input-group password-group">
            <label>Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className="terms">
            <input
              type="checkbox"
              name="terms"
              onChange={handleChange}
            />
            I agree to the <Link to="/terms">Terms & Conditions</Link>
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="signup-btn"
            disabled={loading || !otpSent || !phoneVerified}
          >
            {loading ? "Creating..." : "Continue"}
          </button>

          {/* Login */}
          <p className="login-link">
            Already have an account?{" "}
            <Link to="/sellerlogin">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SellerSignup;
