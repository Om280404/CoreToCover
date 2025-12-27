import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./DesignerSignup.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const DesignerSignup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    experience: "",
    portfolio: "",
    availability: "Available", // Always available
    profileImage: null,
    profilePreview: null,
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  

  const handleSignup = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // TODO: API integration
    navigate("/designersubscription");
  };

  return (
    <div className="designer-auth-page">
      <div className="auth-box reveal">

        <h1 className="auth-logo">Casa Designers</h1>
        <p className="auth-sub">Join as a Designer</p>

        <form onSubmit={handleSignup} className="auth-form">


          {/* Full Name */}
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

          {/* Email */}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Mobile */}
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

          {/* Loaction */}
          <div className="field">
            <label>Location</label>
            <input
              type="text"
              name="location"
              placeholder="Enter your city or location"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
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

          {/* Confirm Password */}
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
                onClick={() => setShowConfirmPass(!showConfirmPass)}
              >
                {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Availability - always ON */}
          <div className="field full">
            <label>Availability</label>
            <input
              type="text"
              value="Available"
              disabled
              className="disabled-field"
            />
          </div>

          <button className="auth-btn" type="submit">
            Create Designer Account
          </button>

        </form>
        <div className="card-footer">
          <small>By signing up you agree to our terms. We respect your privacy.</small>
        </div>

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
