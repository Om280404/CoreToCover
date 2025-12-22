import React, { useState, useEffect } from "react";
import "./DesignerExperience.css";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaPlus,
  FaTrashAlt,
  FaSave,
} from "react-icons/fa";

const DesignerExperience = () => {
  const [works, setWorks] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const designerId = localStorage.getItem("designerId");

  /* =========================
     FETCH PORTFOLIO
  ========================= */
  useEffect(() => {
    if (!designerId) return;

    fetch(`http://localhost:3001/designer/${designerId}/portfolio`)
      .then((res) => res.json())
      .then((data) => setWorks(data))
      .catch(console.error);
  }, [designerId]);

  /* =========================
     ADD NEW WORK (LOCAL)
  ========================= */
  const addWork = () => {
    if (works.length >= 5) return;

    setWorks((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`, // temp id
        image: null,
        preview: null,
        description: "",
        isNew: true,
      },
    ]);
  };

  /* =========================
     IMAGE CHANGE
  ========================= */
  const handleImageChange = (id, file) => {
    if (!file) return;

    setWorks((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              image: file,
              preview: URL.createObjectURL(file),
            }
          : w
      )
    );
  };

  /* =========================
     DESCRIPTION CHANGE
  ========================= */
  const handleDescriptionChange = (id, value) => {
    setWorks((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, description: value } : w
      )
    );
  };

  /* =========================
     SAVE / UPDATE WORK
  ========================= */
  const saveWork = async (work) => {
    if (!work.description && !work.image) {
      alert("Please add image or description");
      return;
    }

    setSavingId(work.id);

    const formData = new FormData();
    formData.append("description", work.description || "");
    if (work.image) formData.append("image", work.image);

    try {
      let res;
      let data;

      // ✅ NEW WORK
      if (work.isNew) {
        res = await fetch(
          `http://localhost:3001/designer/${designerId}/work`,
          {
            method: "POST",
            body: formData,
          }
        );
      }
      // ✅ UPDATE EXISTING WORK
      else {
        res = await fetch(
          `http://localhost:3001/designer/work/${work.id}`,
          {
            method: "PUT",
            body: formData,
          }
        );
      }

      data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to save work");
        return;
      }

      // 🔁 Replace temp or existing work
      setWorks((prev) =>
        prev.map((w) =>
          w.id === work.id ? data.work : w
        )
      );
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setSavingId(null);
    }
  };

  /* =========================
     DELETE WORK
  ========================= */
  const deleteWork = async (id) => {
    if (!window.confirm("Delete this work?")) return;

    // remove local-only work
    if (String(id).startsWith("new-")) {
      setWorks((prev) => prev.filter((w) => w.id !== id));
      return;
    }

    try {
      await fetch(`http://localhost:3001/designer/work/${id}`, {
        method: "DELETE",
      });

      setWorks((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete work");
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

            <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes /> : <FaBars />}
            </div>
          </div>
        </div>
      </header>

      {/* PAGE */}
      <div className="designer-page">
        <div className="page-header reveal">
          <h1 className="title">My Work Experience</h1>
          <p className="subtitle">
            Showcase your best interior & product designs.
          </p>
        </div>

        {/* EMPTY STATE */}
        {works.length === 0 && (
          <div className="empty-state reveal">
            <img
              src="https://cdn-icons-png.flaticon.com/512/9541/9541430.png"
              alt="Empty"
            />
            <p>You have not added any work yet</p>

            <button className="add-work-btn" onClick={addWork}>
              I want to add my work experience
            </button>
          </div>
        )}

        {/* LIST */}
        <div className="experience-list">
          {works.map((work) => (
            <div key={work.id} className="experience-item reveal">
              {/* IMAGE */}
              <label className="experience-image">
                {work.preview ? (
                  <img src={work.preview} alt="work" />
                ) : (
                  <div className="image-placeholder">
                    <FaPlus />
                    <span>Upload Image</span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange(work.id, e.target.files[0])
                  }
                />
              </label>

              {/* DETAILS */}
              <div className="experience-details">
                <textarea
                  className="experience-description"
                  placeholder="Describe your work..."
                  value={work.description || ""}
                  onChange={(e) =>
                    handleDescriptionChange(work.id, e.target.value)
                  }
                />

                <div className="actions">
                  <button
                    className="edit-btn"
                    onClick={() => saveWork(work)}
                    disabled={savingId === work.id}
                  >
                    <FaSave />
                    {savingId === work.id ? "Saving..." : "Save"}
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteWork(work.id)}
                  >
                    <FaTrashAlt /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ADD BUTTON */}
        <button
          className={`add-work-btn big-btn ${
            works.length >= 5 ? "disabled" : ""
          }`}
          onClick={addWork}
          disabled={works.length >= 5}
        >
          <FaPlus /> Add New Work ({works.length}/5)
        </button>
      </div>
    </>
  );
};

export default DesignerExperience;
