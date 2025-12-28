import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./DesignerSignup.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  designerSignup,
  sendDesignerOtp,
  verifyDesignerOtp,
} from "../../api/designer";

const DesignerSignup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    mobile: "",
    location: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
     SEND EMAIL OTP
  ========================= */
  const handleSendOtp = async () => {
    if (!form.email) {
      setError("Enter email first");
      return;
    }

    try {
      setSendingOtp(true);
      setError("");

      await sendDesignerOtp(form.email.trim().toLowerCase());
      setOtpSent(true);

      alert("OTP sent to your email. Check inbox / spam.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  /* =========================
     VERIFY EMAIL OTP
  ========================= */
  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Enter OTP");
      return;
    }

    try {
      setVerifyingOtp(true);
      setError("");

      await verifyDesignerOtp(
        form.email.trim().toLowerCase(),
        otp.trim()
      );

      setEmailVerified(true);
      alert("Email verified ✅");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  /* =========================
     SUBMIT SIGNUP
  ========================= */
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailVerified) {
      setError("Verify email before signup");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const data = await designerSignup({
        fullname: form.fullname,
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile,
        location: form.location,
        password: form.password,
      });

      localStorage.setItem("designerId", data.designer.id);
      navigate("/designer_profile_setup");
    } catch (err) {
      console.error("DESIGNER SIGNUP ERROR:", err);

      if (err.response?.status === 409 || err.response?.status === 400) {
        setError(err.response.data.message);
      } else {
        setError("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="designer-auth-page">
      <div className="auth-box reveal">
        <h1 className="auth-logo">Casa Designers</h1>
        <p className="auth-sub">Join as a Designer</p>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSignup} className="auth-form">
          <div className="field">
            <label>Full Name</label>
            <input
              type="text"
              name="fullname"
              placeholder="Enter your name"
              value={form.fullname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={emailVerified}
            />
          </div>

          {/* OTP SECTION */}
          <div className="field full">
            <button
              type="button"
              className="auth-btn"
              onClick={handleSendOtp}
              disabled={otpSent || sendingOtp || emailVerified}
            >
              {emailVerified
                ? "Email Verified"
                : otpSent
                  ? "OTP Sent"
                  : sendingOtp
                    ? "Sending..."
                    : "Send OTP"}
            </button>


            {otpSent && !emailVerified && (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                />
                <button
                  type="button"
                  className="auth-btn"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp}
                >
                  {verifyingOtp ? "Verifying..." : "Verify OTP"}
                </button>
              </>
            )}

            {emailVerified && (
              <p style={{ color: "green" }}>Email verified ✓</p>
            )}
          </div>

          <div className="field">
            <label>Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              placeholder="Enter your mobile number"
              value={form.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Location</label>
            <input
              type="text"
              name="location"
              placeholder="City or location"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <div className="password-wrap">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="field">
            <label>Confirm Password</label>
            <div className="password-wrap">
              <input
                type={showConfirmPass ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() =>
                  setShowConfirmPass(!showConfirmPass)
                }
              >
                {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="field full">
            <label>Availability</label>
            <input type="text" value="Available" disabled />
          </div>

          <button
            className="auth-btn"
            type="submit"
            disabled={loading || !emailVerified}
          >
            {loading ? "Creating Account..." : "Create Designer Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already registered?{" "}
          <Link to="/designerlogin" className="auth-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default DesignerSignup;
