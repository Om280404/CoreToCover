import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./DesignerLogin.css";
import { designerLogin } from "../../api/designer";

const DesignerLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const data = await designerLogin({
        email: form.email,
        password: form.password,
      });

      // ✅ Save designerId
      localStorage.setItem("designerId", data.designer.id);

      navigate("/designerdashboard");
    } catch (err) {
      console.error("DESIGNER LOGIN ERROR:", err);

      if (err.message) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="designer-login-page">
      <div className="login-box login-reveal">
        <h1 className="login-logo">Casa Designers</h1>
        <p className="login-sub">Login to your designer workspace</p>

        {error && <p className="auth-error">{error}</p>}

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

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
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
