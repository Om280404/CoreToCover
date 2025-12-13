import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./DesignerLogin.css";

const DesignerLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/designer-dashboard");
  };

  return (
    <div className="designer-login-page">
      <div className="login-box login-reveal">
        <h1 className="login-logo">Casa Designers</h1>
        <p className="login-sub">Login to your designer workspace</p>

        <form onSubmit={handleLogin} className="login-form">
          
          <div className="login-field">
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

          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="login-btn" type="submit">
            Login
          </button>
        </form>

        <p className="login-footer">
          New to Casa?{" "}
          <Link to="/designersignup" className="login-link">
            Sign up as Designer
          </Link>
        </p>
      </div>
    </div>
  );
};

export default DesignerLogin;
