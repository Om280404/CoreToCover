// File: src/components/customer/DesignerInfo.jsx
import React, { useEffect, useState } from "react";
import "./DesignerInfo.css";
import Navbar from "./Navbar";
import {
  FaArrowLeft,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import { useLocation } from "react-router-dom";
import { FaExternalLinkAlt } from "react-icons/fa";
import { hireDesigner } from "../../api/designer";



/* =========================
   Expandable Text
========================= */
const ExpandableText = ({ text = "", limit = 160 }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;

  const isLong = text.length > limit;
  return (
    <p className="expandable-text">
      {expanded || !isLong ? text : `${text.slice(0, limit)}...`}
      {isLong && (
        <span className="see-more-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? " See less" : " See more"}
        </span>
      )}
    </p>
  );
};

/* =========================
   Render Stars
========================= */
const renderStars = (avg) => {
  if (!Number.isFinite(avg)) return null;

  const full = Math.floor(avg);
  const half = avg - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <>
      {[...Array(full)].map((_, i) => (
        <FaStar key={`f${i}`} className="star filled" />
      ))}
      {half && <FaStarHalfAlt className="star half" />}
      {[...Array(empty)].map((_, i) => (
        <FaRegStar key={`e${i}`} className="star empty" />
      ))}
    </>
  );
};

const DesignerInfo = () => {
  const location = useLocation();
  const designerId = location.state?.designer?.id;

  const [designer, setDesigner] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  const [ratingsSummary, setRatingsSummary] = useState(null);
  const [reviewsPage, setReviewsPage] = useState(0);
  const REVIEWS_PER_PAGE = 5;

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [hireLoading, setHireLoading] = useState(false);
  const [formError, setFormError] = useState("");

  /* ===== OLD FORM STRUCTURE ===== */
  const [hireForm, setHireForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    location: "",
    budget: "",
    workType: "",
    timelineDays: "",
    description: "",
  });

  /* =========================
     Fetch Designer Info + Reviews
  ========================= */
  useEffect(() => {
    if (!designerId) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [infoRes, ratingsRes] = await Promise.all([
          fetch(`http://localhost:3001/designer/${designerId}/info`),
          fetch(`http://localhost:3001/designer/${designerId}/ratings`),
        ]);

        if (!infoRes.ok) throw new Error("Failed");

        const info = await infoRes.json();
        const ratings = ratingsRes.ok ? await ratingsRes.json() : null;

        setDesigner(info);
        setRatingsSummary(ratings);
        if (info.works?.length) setActiveImage(info.works[0].img);
      } catch (err) {
        console.error("DESIGNER LOAD ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [designerId]);

  /* =========================
     Hire Form Handlers
  ========================= */
  const handleHireChange = (e) => {
    const { name, value } = e.target;
    setFormError("");
    setHireForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const userId = localStorage.getItem("userId");

    if (!userId) {
      setFormError("Please login first");
      return;
    }

    try {
      setHireLoading(true);

      await hireDesigner(designerId, {
        userId, // ✅ important
        fullName: hireForm.fullName,
        email: hireForm.email,
        mobile: hireForm.mobile,
        location: hireForm.location,
        budget: Number(hireForm.budget),
        workType: hireForm.workType,
        timelineDays: hireForm.timelineDays || null,
        description: hireForm.description || null,
      });

      alert("Request sent successfully!");
      setShowForm(false);

      // optional: reset form
      setHireForm({
        fullName: "",
        mobile: "",
        email: "",
        location: "",
        budget: "",
        workType: "",
        timelineDays: "",
        description: "",
      });
    } catch (err) {
      console.error("HIRE ERROR:", err);
      setFormError(
        err.response?.data?.message || "Failed to send request"
      );
    } finally {
      setHireLoading(false);
    }
  };




  if (loading) {
    return (
      <>
        <Navbar />
        <p style={{ padding: 40 }}>Loading designer info...</p>
      </>
    );
  }

  if (!designer) {
    return (
      <>
        <Navbar />
        <p style={{ padding: 40 }}>Designer not found</p>
      </>
    );
  }

  const reviews = ratingsSummary?.reviews || [];
  const avg = ratingsSummary?.average ?? null;
  const pages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);

  return (
    <>
      <Navbar />

      <div className="designer-info-page">
        <button className="back-btn" onClick={() => window.history.back()}>
          <FaArrowLeft /> Back
        </button>

        <div className="designer-info-layout">
          {/* LEFT */}
          <div className="designer-text">
            <img src={designer.image} alt="designer" className="designer-photo" />

            <div className="title-row">
              <h1 className="designer-name">{designer.name}</h1>

              <div
                className={`availability-pill ${designer.availability ? "available" : "busy"
                  }`}
              >
                <span className="dot" />
                {designer.availability ? "Available" : "Busy"}
              </div>
            </div>

            <h3 className="designer-role">{designer.designerType}</h3>


            {/* 🔗 PORTFOLIO LINK */}
            {designer.portfolio && (
              <a
                href={designer.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="portfolio-link"
              >
                View Portfolio <FaExternalLinkAlt />
              </a>
            )}

            <p className="designer-location">
              <LuMapPin /> {designer.location}
            </p>

            <div className="designer-rating-summary">
              {avg !== null ? (
                <>
                  <div className="stars-large">{renderStars(avg)}</div>
                  <div className="average-number">{avg.toFixed(1)} / 5</div>
                </>
              ) : (
                <div className="no-rating">No ratings yet</div>
              )}
            </div>

            <ExpandableText text={designer.bio} />

            <button
              className={`hire-btn ${!designer.availability ? "disabled" : ""}`}
              onClick={() => setShowForm(true)}
              disabled={!designer.availability}
            >
              {designer.availability
                ? "Hire This Designer"
                : "Currently Unavailable"}
            </button>
          </div>

          {/* RIGHT */}
          <div className="designer-main-image">
            {activeImage && <img src={activeImage} alt="work" />}
          </div>
        </div>

        {/* =========================
            REVIEWS (UNCHANGED)
        ========================= */}
        <div className="reviews-section">
          <h2>Reviews</h2>

          {reviews.length === 0 ? (
            <p className="empty-text">No reviews yet.</p>
          ) : (
            <>
              <ul className="reviews-lists">
                {reviews
                  .slice(
                    reviewsPage * REVIEWS_PER_PAGE,
                    (reviewsPage + 1) * REVIEWS_PER_PAGE
                  )
                  .map((r, i) => (
                    <li key={i} className="review-item">
                      <strong>{r.name}</strong>
                      <div className="review-stars">
                        {renderStars(r.stars)}
                      </div>
                      <p>{r.review || <em>No comment</em>}</p>
                      <div className="review-meta">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
              </ul>

              {pages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setReviewsPage((p) => Math.max(0, p - 1))}
                    disabled={reviewsPage === 0}
                  >
                    Prev
                  </button>
                  <span>
                    Page {reviewsPage + 1} of {pages}
                  </span>
                  <button
                    onClick={() =>
                      setReviewsPage((p) => Math.min(p + 1, pages - 1))
                    }
                    disabled={reviewsPage === pages - 1}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* =========================
            HIRE MODAL (OLD STRUCTURE)
        ========================= */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Hire This Designer</h2>

              {formError && <p className="form-error">{formError}</p>}

              <form className="modal-form" onSubmit={handleHireSubmit}>
                <label>
                  Full Name
                  <input
                    name="fullName"
                    value={hireForm.fullName}
                    onChange={handleHireChange}
                    required
                  />
                </label>

                <label>
                  Mobile Number
                  <input
                    name="mobile"
                    value={hireForm.mobile}
                    onChange={handleHireChange}
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={hireForm.email}
                    onChange={handleHireChange}
                    required
                  />
                </label>

                <label>
                  City / Location
                  <input
                    name="location"
                    value={hireForm.location}
                    onChange={handleHireChange}
                    required
                  />
                </label>

                <label>
                  Budget in Rs
                  <input
                    type="number"
                    name="budget"
                    value={hireForm.budget}
                    onChange={handleHireChange}
                    required
                  />
                </label>

                <label>
                  Type of Work
                  <select
                    name="workType"
                    value={hireForm.workType}
                    onChange={handleHireChange}
                    required
                  >
                    <option value="">Select type</option>
                    <option>Interior Design</option>
                    <option>Product Design</option>
                    <option>Renovation</option>
                    <option>Furniture Design</option>
                  </select>
                </label>

                <label>
                  Timeline (days)
                  <input
                    type="number"
                    name="timelineDays"
                    value={hireForm.timelineDays}
                    onChange={handleHireChange}
                  />
                </label>

                <label className="desc">
                  Project Description
                  <textarea
                    name="description"
                    value={hireForm.description}
                    onChange={handleHireChange}
                  />
                </label>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={hireLoading}
                  >
                    {hireLoading ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DesignerInfo;
