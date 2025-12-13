import React, { useState } from "react";
import "./DesignerWorkReceived.css";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaPhoneAlt, FaUser, FaCalendarAlt, FaRupeeSign, } from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";

const DesignerWorkReceived = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([
        {
            id: 1,
            clientName: "Aarav Sharma",
            mobile: "9876543210",
            type: "Full Home Interior",
            budget: "2,50,000",
            location: "Bangalore",
            timeline: "45 Days",
            status: "new",
            message: "Looking for a complete 2BHK modern interior transformation.",
        },
        {
            id: 2,
            clientName: "Meera Patel",
            mobile: "9123456780",
            type: "Modular Kitchen",
            budget: "90,000",
            location: "Mumbai",
            timeline: "25 Days",
            status: "in-progress",
            message: "Minimalist, clean kitchen with matte finishes.",
        },
        {
            id: 3,
            clientName: "Rahul Menon",
            mobile: "8899776655",
            type: "Furniture Product Design",
            budget: "35,000",
            location: "Chennai",
            timeline: "15 Days",
            status: "completed",
            message: "Custom wooden study desk design for a small space.",
        },
    ]);


    const updateStatus = (id, newStatus) => {
        setJobs(
            jobs.map((job) => (job.id === id ? { ...job, status: newStatus } : job))
        );
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
            <div className="lux-work-page">
                <div className="lux-header reveal">
                    <h1 className="lux-title">Work Requests</h1>
                    <p className="lux-sub">
                        Premium client leads curated exclusively for you as a CASA Designer.
                    </p>
                </div>

                <div className="lux-job-list">
                    {jobs.map((job) => (
                        <div key={job.id} className="lux-job-card reveal delay-1">
                            <div className="lux-card-left">
                                <h2 className="lux-client-name">
                                    <FaUser /> {job.clientName}
                                </h2>

                                <div className="lux-field">
                                    <label>Project Type</label>
                                    <p>{job.type}</p>
                                </div>

                                <div className="lux-field">
                                    <label>Budget</label>
                                    <p>
                                        <FaRupeeSign /> {job.budget}
                                    </p>
                                </div>

                                <div className="lux-field">
                                    <label>Location</label>
                                    <p>
                                        <LuMapPin  /> {job.location}
                                    </p>
                                </div>

                                <div className="lux-field">
                                    <label>Estimated Timeline</label>
                                    <p>
                                        <FaCalendarAlt /> {job.timeline}
                                    </p>
                                </div>

                                <div className="lux-field">
                                    <label>Client Message</label>
                                    <p className="lux-message">“{job.message}”</p>
                                </div>

                                <div className="client-info">
                                    <span className="client-icon ">
                                        <FaPhoneAlt className="phone-icon"/>
                                    </span>
                                    <p className="client-value">+91 {job.mobile}</p>
                                </div>

                            </div>

                            <div className="lux-card-right">
                                <span className={`lux-status ${job.status}`}>
                                    {job.status === "new" && "New Request"}
                                    {job.status === "in-progress" && "In Progress"}
                                    {job.status === "completed" && "Completed"}
                                </span>

                                <div className="lux-buttons">
                                    {job.status === "new" && (
                                        <>
                                            <button
                                                className="lux-btn accept"
                                                onClick={() => updateStatus(job.id, "in-progress")}
                                            >
                                                Accept Work
                                            </button>
                                            <button
                                                className="lux-btn decline"
                                                onClick={() => updateStatus(job.id, "declined")}
                                            >
                                                Decline
                                            </button>
                                        </>
                                    )}

                                    {job.status === "in-progress" && (
                                        <button
                                            className="lux-btn complete"
                                            onClick={() => updateStatus(job.id, "completed")}
                                        >
                                            Mark Completed
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default DesignerWorkReceived;
