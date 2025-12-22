import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { customerLogin } from "../../api/auth";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await customerLogin({ email, password });

      // 🔥 RESET SESSION
      localStorage.clear();

      // ✅ SINGLE SOURCE OF TRUTH
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("userEmail", res.data.user.email);
      localStorage.setItem("userName", res.data.user.name);

      navigate("/");
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1 className="brand-heading">Casa</h1>
        <h2>Sign in</h2>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />

          <div className="password-wrap">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>

          <p>
            Don’t have an account? <Link to="/signup">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
