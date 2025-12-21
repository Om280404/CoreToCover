import React, { useState, useEffect } from "react";
import "./DesignerEditProfile.css";
import { FaCamera, FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const DesignerEditProfile = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const designerId = localStorage.getItem("designerId");

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    mobile: "",
    location: "",
    experience: "",
    portfolio: "",
    bio: "",
    designerType: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     REDIRECT IF NOT LOGGED IN
  ========================= */
  useEffect(() => {
    if (!designerId) {
      navigate("/designersignup");
    }
  }, [designerId, navigate]);

  /* =========================
     FETCH PROFILE DATA
  ========================= */
  useEffect(() => {
    if (!designerId) return;

    fetch(`http://localhost:3001/designer/${designerId}/edit-profile`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          fullname: data.fullname || "",
          email: data.email || "",
          mobile: data.mobile || "",
          location: data.location || "",
          experience: data.experience || "",
          portfolio: data.portfolio || "",
          bio: data.bio || "",
          designerType: data.designerType || "",
        });

        if (data.profileImage) {
          setPreview(data.profileImage);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load profile");
      });
  }, [designerId]);

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
     IMAGE UPLOAD
  ========================= */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  /* =========================
     SUBMIT UPDATE
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        formData.append(key, value)
      );

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const res = await fetch(
        `http://localhost:3001/designer/${designerId}/edit-profile`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update profile");
        return;
      }

      alert("Profile updated successfully");
      navigate("/designerdashboard");
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Link to="/designerdashboard" className="nav-link">
              <h1 className="logo">CASA</h1>
            </Link>
          </div>

          <div className="nav-right">
            <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
              <li>
                <Link to="/login" className="seller-btn">
                  Login as Customer
                </Link>
              </li>
            </ul>

            <div
              className="hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </div>
          </div>
        </div>
      </header>

      {/* PAGE */}
      <div className="edit-profile-page">
        <div className="edit-profile-container reveal">
          <h1 className="edit-title">Edit Profile</h1>
          <p className="edit-sub">
            Update your personal information and designer details.
          </p>

          {error && <p className="form-error">{error}</p>}

          {/* PROFILE IMAGE */}
          <div className="profile-image-section">
            <div className="image-wrapper">
              {preview ? (
                <img src={preview} alt="Profile" className="profile-img" />
              ) : (
                <div className="placeholder">
                  <FaCamera className="camera-icon" />
                </div>
              )}

              <label className="upload-btn">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          {/* FORM */}
          <form className="edit-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>Full Name</label>
              <input
                name="fullname"
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
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Experience</label>
              <input
                type="number"
                name="experience"
                value={form.experience}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Portfolio Link</label>
              <input
                name="portfolio"
                value={form.portfolio}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
              />
            </div>

            <button className="save-btn" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default DesignerEditProfile;
