import React, { useState } from "react";
import "./DesignerEditProfile.css";
import { FaCamera, FaBars, FaTimes  } from "react-icons/fa";
import { Link, useNavigate, } from "react-router-dom";


const DesignerEditProfile = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setProfileImage(file);
        setPreview(URL.createObjectURL(file));
    };

    return (
        <>
            <header className="navbar">
                <div className="nav-container">
                    <div className="nav-left">
                        <Link to="/designerdashboard" className="nav-link">
                            <h1 className="logo">CASA</h1>
                        </Link>
                    </div>

                    {/* Right: Links + Hamburger (Mobile) */}
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
            <div className="edit-profile-page">
                <div className="edit-profile-container reveal">

                    <h1 className="edit-title">Edit Profile</h1>
                    <p className="edit-sub">
                        Update your personal information and designer details.
                    </p>

                    {/* Profile Image */}
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
                                <input type="file" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="edit-form">

                        <div className="field">
                            <label>Full Name</label>
                            <input type="text" placeholder="Enter your full name" />
                        </div>

                        <div className="field">
                            <label>Email</label>
                            <input type="email" placeholder="Enter your email" />
                        </div>

                        <div className="field">
                            <label>Mobile Number</label>
                            <input type="tel" placeholder="Enter your mobile number" />
                        </div>

                        <div className="field">
                            <label>Location</label>
                            <input type="text" placeholder="Enter your location" />
                        </div>

                        <div className="field">
                            <label>Experience</label>
                            <input type="number" placeholder="Years of experience" />
                        </div>

                        <div className="field">
                            <label>Portfolio Link</label>
                            <input type="text" placeholder="Behance / Dribbble / Website" />
                        </div>

                        <div className="field">
                            <label>Bio</label>
                            <textarea placeholder="Write a short intro about yourself..." />
                        </div>

                        <button className="save-btn">Save Changes</button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default DesignerEditProfile;
