import React, { useState, useEffect } from "react";
import "./DesignerDashboard.css";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPalette,
  FaEdit,
  FaUserTie,
  FaHandshake,
  FaBars,
  FaTimes,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

const DesignerDashboard = () => {
  const navigate = useNavigate();

  const [available, setAvailable] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [designerName, setDesignerName] = useState("Designer");
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  /* =========================
     FETCH DESIGNER BASIC INFO
  ========================= */
  useEffect(() => {
    const designerId = localStorage.getItem("designerId");
    if (!designerId) return;

    fetch(`http://localhost:3001/designer/${designerId}/basic`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.fullname) {
          setDesignerName(data.fullname);
        }
        if (data?.availability) {
          setAvailable(data.availability === "Available");
        }
      })
      .catch((err) => {
        console.error("Failed to load designer info", err);
      });
  }, []);

  /* =========================
     TOGGLE AVAILABILITY
  ========================= */
  const toggleAvailability = async () => {
    const designerId = localStorage.getItem("designerId");
    if (!designerId) return;

    const newStatus = available ? "Unavailable" : "Available";

    try {
      setLoadingAvailability(true);

      const res = await fetch(
        `http://localhost:3001/designer/${designerId}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ availability: newStatus }),
        }
      );

      if (!res.ok) {
        alert("Failed to update availability");
        return;
      }

      setAvailable(!available);
    } catch (err) {
      console.error("Availability update failed", err);
      alert("Server error while updating availability");
    } finally {
      setLoadingAvailability(false);
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

      {/* DASHBOARD */}
      <div className="designer-dashboard">
        <div className="dash-header reveal">
          <h1 className="dash-title">Welcome, {designerName}</h1>
          <p className="dash-sub">
            Manage your portfolio, view client requests and grow your design presence.
          </p>
        </div>

        <div className="dash-grid">
          {/* Portfolio */}
          <div
            className="dash-card reveal delay-1"
            onClick={() => navigate("/designerexperience")}
          >
            <div className="dash-icon">
              <FaPalette />
            </div>
            <h3>My Portfolio</h3>
            <p>Upload, edit or manage your best design works.</p>
          </div>

          {/* Work Received */}
          <div
            className="dash-card reveal delay-2"
            onClick={() => navigate("/designerworkreceived")}
          >
            <div className="dash-icon">
              <FaHandshake />
            </div>
            <h3>Work Received</h3>
            <p>See customers who hired you & manage their projects.</p>
          </div>

          {/* Edit Profile */}
          <div
            className="dash-card reveal delay-3"
            onClick={() => navigate("/designereditprofile")}
          >
            <div className="dash-icon">
              <FaEdit />
            </div>
            <h3>Edit Profile</h3>
            <p>Update your designer details & portfolio links.</p>
          </div>

          {/* Settings */}
          <div className="dash-card reveal delay-4">
            <div className="dash-icon">
              <FaUserTie />
            </div>
            <h3>Designer Settings</h3>
            <p>Set availability.</p>

            <div className="setting-card reveal delay-1">
              <div className="setting-info">
                <h3>Availability</h3>
                <p>Show clients whether you are currently accepting projects.</p>
              </div>

              <button
                className="toggle-btn"
                onClick={toggleAvailability}
                disabled={loadingAvailability}
              >
                {available ? (
                  <FaToggleOn className="toggle-icon on" />
                ) : (
                  <FaToggleOff className="toggle-icon off" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DesignerDashboard;
