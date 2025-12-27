import React, { useState, useEffect } from "react";
import "./DesignerExperience.css";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaPlus, FaTrashAlt, FaEdit } from "react-icons/fa";

const DesignerExperience = () => {
  const [works, setWorks] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // SAMPLE WORKS ON FIRST LOAD
  useEffect(() => {
    if (works.length === 0) {
      setWorks([
        {
          id: 1,
          preview:
            "https://images.pexels.com/photos/6588580/pexels-photo-6588580.jpeg",
          description: "Modern living room interior with warm tones.",
        },
        {
          id: 2,
          preview:
            "https://images.pexels.com/photos/3965520/pexels-photo-3965520.jpeg",
          description: "Minimalistic bedroom with soft lighting.",
        },
        {
          id: 3,
          preview:
            "https://images.pexels.com/photos/6588582/pexels-photo-6588582.jpeg",
          description: "Elegant wooden furniture design concept.",
        },
      ]);
    }
  }, []);

  // ADD NEW WORK (MAX 5)
  const addWork = () => {
    if (works.length >= 5) return;
    setWorks([
      ...works,
      {
        id: Date.now(),
        image: null,
        preview: null,
        description: "",
      },
    ]);
  };

  const handleImageChange = (id, file) => {
    const updated = works.map((work) =>
      work.id === id
        ? { ...work, image: file, preview: URL.createObjectURL(file) }
        : work
    );
    setWorks(updated);
  };

  const handleDescriptionChange = (id, value) => {
    const updated = works.map((work) =>
      work.id === id ? { ...work, description: value } : work
    );
    setWorks(updated);
  };

  const deleteWork = (id) => {
    setWorks(works.filter((work) => work.id !== id));
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

      <div className="designer-page">
        <div className="page-header reveal">
          <h1 className="title">My Work Experience</h1>
          <p className="subtitle">Showcase your best interior & product designs.</p>
        </div>

        {/* EMPTY STATE */}
        {works.length === 0 && (
          <div className="empty-state reveal">
            <img
              src="https://cdn-icons-png.flaticon.com/512/9541/9541430.png"
              alt="Empty"
            />
            <p>You did not enter your work experience before</p>

            <button className="add-work-btn" onClick={addWork}>
              I want to add my work experience
            </button>
          </div>
        )}

        {/* NEW SHOWCASE LIST STYLE */}
        <div className="experience-list">
          {works.map((work) => (
            <div key={work.id} className="experience-item reveal">
              {/* IMAGE SIDE */}
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

              {/* DETAILS SIDE */}
              <div className="experience-details">
                <textarea
                  className="experience-description"
                  placeholder="Describe your work..."
                  value={work.description}
                  onChange={(e) =>
                    handleDescriptionChange(work.id, e.target.value)
                  }
                ></textarea>

                <div className="actions">
                  <button className="edit-btn">
                    <FaEdit /> Edit
                  </button>
                  <button className="delete-btn" onClick={() => deleteWork(work.id)}>
                    <FaTrashAlt /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ADD NEW WORK BUTTON (DISABLED IF >5) */}
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
