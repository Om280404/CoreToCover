import React, { useState, useEffect } from "react";
import "./DesignerProfileSetup.css";
import { useNavigate } from "react-router-dom";

const DesignerProfileSetup = () => {
  const navigate = useNavigate();

  // 🔑 Get designerId saved after signup
  const designerId = localStorage.getItem("designerId");

  const [form, setForm] = useState({
    experience: "",
    portfolio: "",
    designerType: "",
    bio: "",
    profileImage: null,
    profilePreview: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     REDIRECT IF NO DESIGNER ID
  ========================= */
  useEffect(() => {
    if (!designerId) {
      navigate("/designersignup");
    }
  }, [designerId, navigate]);

  /* =========================
     IMAGE UPLOAD
  ========================= */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      profileImage: file,
      profilePreview: URL.createObjectURL(file),
    }));
  };

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* =========================
     SUBMIT PROFILE
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!designerId) {
      setError("Designer not found. Please sign up again.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("designerId", designerId);
      formData.append("experience", form.experience);
      formData.append("portfolio", form.portfolio);
      formData.append("designerType", form.designerType);
      formData.append("bio", form.bio);

      if (form.profileImage) {
        formData.append("profileImage", form.profileImage);
      }

      const res = await fetch("http://localhost:3001/designer/profile", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to save profile");
        return;
      }

      // ✅ SUCCESS → next step
      navigate("/designerportfolio");
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="designer-setup-page">
      <div className="designer-setup-card">
        <h1 className="setup-title">Designer Profile Setup</h1>
        <p className="setup-subtitle">
          Tell us more about your design expertise to help customers find you.
        </p>

        {error && <p className="form-error">{error}</p>}

        <form className="designer-form" onSubmit={handleSubmit}>
          {/* Profile Image */}
          <div className="field full">
            <label>Profile Image</label>

            <div className="profile-upload-box">
              {form.profilePreview ? (
                <img
                  src={form.profilePreview}
                  alt="Preview"
                  className="profile-preview"
                />
              ) : (
                <div className="profile-placeholder">
                  Upload Image
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="profile-input"
              />
            </div>
          </div>

          {/* Experience */}
          <label className="input-label">Experience (in years)</label>
          <input
            type="number"
            name="experience"
            className="input-field"
            placeholder="2"
            value={form.experience}
            onChange={handleChange}
            required
          />

          {/* Portfolio */}
          <label className="input-label">Portfolio Link (Optional)</label>
          <input
            type="text"
            name="portfolio"
            className="input-field"
            placeholder="https://yourportfolio.com"
            value={form.portfolio}
            onChange={handleChange}
          />

          {/* Designer Type */}
          <label className="input-label">Designer Type</label>
          <select
            className="input-field designer-type"
            name="designerType"
            value={form.designerType}
            onChange={handleChange}
            required
          >
            <option value="">Select type</option>
            <option value="Interior Designer">Interior Designer</option>
            <option value="Product Designer">Product Designer</option>
            <option value="Furniture Designer">Furniture Designer</option>
            <option value="Lighting Designer">Lighting Designer</option>
            <option value="3D Visualizer / CAD Designer">
              3D Visualizer / CAD Designer
            </option>
          </select>

          {/* Bio */}
          <label className="input-label">Short Bio</label>
          <textarea
            name="bio"
            className="input-field textarea"
            placeholder="Describe your design philosophy..."
            value={form.bio}
            onChange={handleChange}
            required
          ></textarea>

          <button className="setup-btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Next"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DesignerProfileSetup;
