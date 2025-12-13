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

  // --------------------------------------
  // Load profile image from localStorage
  // (Designer uploaded this during signup)
  // --------------------------------------
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const storedImage = localStorage.getItem("designerProfileImage");
    if (storedImage) {
      setProfilePic(storedImage);
    }
  }, []);

  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Link to="/designerdashboard" className="nav-link">
              <h1 className="logo">CASA</h1>
            </Link>
          </div>

          {/* Right Section */}
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

      {/* MAIN DASHBOARD */}
      <div className="designer-dashboard">

        <div className="dash-header reveal">
          <h1 className="dash-title">Welcome, Designer</h1>
          <p className="dash-sub">
            Manage your portfolio, view client requests and grow your design presence.
          </p>
        </div>

        {/* GRID OPTIONS */}
        <div className="dash-grid">

          {/* Portfolio */}
          <div className="dash-card reveal delay-1" onClick={() => navigate("/designerexperience")}>
            <div className="dash-icon"><FaPalette /></div>
            <h3>My Portfolio</h3>
            <p>Upload, edit or manage your best design works.</p>
          </div>

          {/* Work Received */}
          <div className="dash-card reveal delay-2" onClick={() => navigate("/designerworkrecieved")}>
            <div className="dash-icon"><FaHandshake /></div>
            <h3>Work Received</h3>
            <p>See customers who hired you & manage their projects.</p>
          </div>

          {/* Edit Profile */}
          <div className="dash-card reveal delay-3" onClick={() => navigate("/designereditprofile")}>
            <div className="dash-icon"><FaEdit /></div>
            <h3>Edit Profile</h3>
            <p>Update your designer details & portfolio links.</p>
          </div>

          {/* Settings */}
          <div className="dash-card reveal delay-4">
            <div className="dash-icon"><FaUserTie /></div>
            <h3>Designer Settings</h3>
            <p>Set availability.</p>

            <div className="setting-card reveal delay-1">
              <div className="setting-info">
                <h3>Availability</h3>
                <p>Show clients whether you are currently accepting projects.</p>
              </div>

              <button className="toggle-btn" onClick={() => setAvailable(!available)}>
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
