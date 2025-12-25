// File: src/components/designer/DesignerWorkReceived.jsx
import React, { useState, useEffect } from "react";
import "./DesignerWorkReceived.css";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaPhoneAlt,
  FaUser,
  FaCalendarAlt,
  FaRupeeSign,
  FaStar,
} from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import { getDesignerWorkRequests, rateUser, getClientRatings } from "../../api/designer"; // ensure getClientRatings exists

const DesignerWorkReceived = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // rating client modal (you -> client)
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [rateTarget, setRateTarget] = useState(null); // the job object being rated
  const [tempStars, setTempStars] = useState(5);
  const [tempReview, setTempReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // view client summary modal (already present)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

  // NEW: All client ratings modal (ratings from *all designers* about this client)
  const [clientRatingsModalOpen, setClientRatingsModalOpen] = useState(false);
  const [clientRatings, setClientRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  const designerId = localStorage.getItem("designerId");

  useEffect(() => {
    if (!designerId) {
      setLoading(false);
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designerId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getDesignerWorkRequests(designerId); // <-- returns array already
      setJobs(Array.isArray(data) ? data : []); // use data directly
    } catch (err) {
      console.error("Failed fetch work requests", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------
     Rate client (you -> client)
  ------------------------*/
  const openRateModal = (job) => {
    setRateTarget(job);
    setTempStars((job.userRating && job.userRating.stars) || 5);
    setTempReview((job.userRating && job.userRating.review) || "");
    setRateModalOpen(true);
  };

  const closeRateModal = () => {
    setRateModalOpen(false);
    setRateTarget(null);
    setTempStars(5);
    setTempReview("");
  };

  const handleStarClick = (n) => {
    setTempStars(n);
  };

  const submitUserRating = async (e) => {
    e.preventDefault();
    if (!rateTarget) return;

    try {
      setSubmitting(true);
      await rateUser(designerId, {
        hireRequestId: rateTarget.id,
        stars: tempStars,
        review: tempReview,
      });

      await fetchData();
      closeRateModal();
      alert("Client rated successfully");
    } catch (err) {
      console.error("Rate user error:", err);
      alert(err.response?.data?.message || "Failed to rate the client");
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================
     VIEW CLIENT SUMMARY (existing)
  ===================== */
  const openReviewModal = (job) => {
    setReviewTarget(job);
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setReviewTarget(null);
  };

  /* ===========================================
     Fetch all ratings designers gave to client
     Endpoint: GET /client/:email/ratings  (getClientRatings)
  ============================================*/
  const openClientRatings = async (userId) => {
    if (!userId) {
      alert("Client ID not available");
      return;
    }

    try {
      setRatingsLoading(true);
      const data = await getClientRatings(userId);
      setClientRatings(Array.isArray(data) ? data : []);
      setClientRatingsModalOpen(true);
    } catch (err) {
      console.error("fetch client ratings failed", err);
      alert("Failed to load client reviews");
    } finally {
      setRatingsLoading(false);
    }
  };





  const closeClientRatings = () => {
    setClientRatingsModalOpen(false);
    setClientRatings([]);
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
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

      {/* =====================
          REVIEWS SUMMARY MODAL (existing)
      ===================== */}
      {reviewModalOpen && reviewTarget && (
        <div className="modal-overlay" onClick={closeReviewModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Client Reviews (summary)</h2>

            <div style={{ marginBottom: 12 }}>
              <strong>{reviewTarget.clientSummary.average}</strong> / 5
              <div style={{ display: "flex", gap: 4 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar
                    key={i}
                    color={
                      i < Math.round(reviewTarget.clientSummary.average)
                        ? "#f59e0b"
                        : "#d1d5db"
                    }
                  />
                ))}
              </div>
              <small>{reviewTarget.clientSummary.count} reviews</small>
            </div>

            {reviewTarget.clientSummary.reviews.map((r, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <strong>{r.reviewerName}</strong>
                <div style={{ display: "flex", gap: 4 }}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <FaStar
                      key={s}
                      color={s < r.stars ? "#f59e0b" : "#e5e7eb"}
                    />
                  ))}
                </div>
                <p style={{ fontStyle: "italic" }}>
                  “{r.review || "No comment"}”
                </p>
              </div>
            ))}

            <button className="lux-btn decline" onClick={closeReviewModal}>Close</button>
          </div>
        </div>
      )}

      {/* PAGE */}
      <div className="lux-work-page">
        <div className="lux-header reveal">
          <h1 className="lux-title">Work Requests</h1>
          <p className="lux-sub">
            Premium client leads curated exclusively for you as a CASA Designer.
          </p>
        </div>

        <div className="lux-job-list">
          {loading && <p style={{ padding: 20 }}>Loading work requests...</p>}
          {!loading && jobs.length === 0 && (
            <p style={{ padding: 20 }}>No work requests yet.</p>
          )}

          {jobs.map((job) => (
            <div key={job.id} className="lux-job-card reveal delay-1">
              <div className="lux-card-left">
                <h2 className="lux-client-name">
                  <FaUser /> {job.clientName}
                </h2>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div className="lux-field">
                      <label>Project Type</label>
                      <p>{job.type}</p>
                    </div>
                    <div className="lux-field">
                      <label>Budget</label>
                      <p><FaRupeeSign /> {job.budget}</p>
                    </div>
                    <div className="lux-field">
                      <label>Location</label>
                      <p><LuMapPin /> {job.location}</p>
                    </div>
                  </div>
                </div>

                <div className="lux-field">
                  <label>Estimated Timeline</label>
                  <p><FaCalendarAlt /> {job.timeline}</p>
                </div>

                <div className="lux-field">
                  <label>Client Message</label>
                  <p className="lux-message">“{job.message}”</p>
                </div>

                <div className="client-info">
                  <span className="client-icon">
                    <FaPhoneAlt />
                  </span>
                  <p className="client-value">+91 {job.mobile}</p>
                </div>
              </div>

              <div className="lux-card-right">
                <span className={`lux-status ${job.status}`}>
                  {job.status === "pending" && "New Request"}
                  {job.status === "accepted" && "In Progress"}
                  {job.status === "completed" && "Completed"}
                  {job.status === "rejected" && "Declined"}
                </span>

                {job.userRating ? (
                  <div className="given-rating">
                    <div style={{ marginBottom: 6, fontWeight: 700 }}>You rated this client</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {Array.from({ length: 5 }).map((_, i) => {
                        const filled = i < job.userRating.stars;
                        return <FaStar key={i} className={filled ? "star filled" : "star empty"} />;
                      })}
                    </div>
                    {job.userRating.review && <div className="given-review">"{job.userRating.review}"</div>}
                  </div>
                ) : (
                  job.status === "completed" && (
                    <button
                      className="lux-btn accept"
                      onClick={() => openRateModal(job)}
                      style={{ marginTop: 12 }}
                    >
                      Rate Client
                    </button>
                  )
                )}

                <div className="lux-buttons">
                  {/* NEW: open full client ratings across platform */}
                  <button
                    className="lux-btn secondary"
                    onClick={() => openClientRatings(job.userId)}
                    style={{ marginTop: 10 }}
                  >
                    View Client Reviews
                  </button>

                  {job.status === "pending" && (
                    <>
                      <button
                        className="lux-btn accept"
                        onClick={async () => {
                          try {
                            const res = await fetch(
                              `http://localhost:3001/designer/work-request/${job.id}/status`,
                              {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: "accepted" }),
                              }
                            );
                            if (!res.ok) throw new Error("Failed");
                            setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "accepted" } : j)));
                          } catch (err) {
                            alert("Failed to accept");
                          }
                        }}
                      >
                        Accept Work
                      </button>

                      <button
                        className="lux-btn decline"
                        onClick={async () => {
                          try {
                            const res = await fetch(
                              `http://localhost:3001/designer/work-request/${job.id}/status`,
                              {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: "rejected" }),
                              }
                            );
                            if (!res.ok) throw new Error("Failed");
                            setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "rejected" } : j)));
                          } catch (err) {
                            alert("Failed to decline");
                          }
                        }}
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {job.status === "accepted" && (
                    <button
                      className="lux-btn complete"
                      onClick={async () => {
                        try {
                          const res = await fetch(
                            `http://localhost:3001/designer/work-request/${job.id}/status`,
                            {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "completed" }),
                            }
                          );
                          if (!res.ok) throw new Error("Failed");
                          setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "completed" } : j)));
                        } catch (err) {
                          alert("Failed to update to completed");
                        }
                      }}
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

      {/* RATE MODAL */}
      {rateModalOpen && rateTarget && (
        <div className="modal-overlay" onClick={closeRateModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Rate client: {rateTarget.clientName}</h2>

            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <button
                      key={n}
                      aria-label={`Rate ${n} star`}
                      className={`star-btn ${n <= tempStars ? "active" : ""}`}
                      onClick={() => handleStarClick(n)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 22,
                      }}
                    >
                      <FaStar className={n <= tempStars ? "star filled" : "star empty"} />
                    </button>
                  );
                })}
              </div>

              <textarea
                placeholder="Write a short review (optional)"
                value={tempReview}
                onChange={(e) => setTempReview(e.target.value)}
                style={{ width: "100%", minHeight: 100, marginTop: 12, padding: 8 }}
              />

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                <button className="lux-btn decline" onClick={closeRateModal}>Cancel</button>
                <button className="lux-btn complete" onClick={submitUserRating} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Rating"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW: CLIENT RATINGS (all designers -> this client) */}
      {clientRatingsModalOpen && (
        <div className="modal-overlay" onClick={closeClientRatings}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>All Ratings for Client</h2>

            {ratingsLoading ? (
              <p>Loading...</p>
            ) : clientRatings.length === 0 ? (
              <p>No ratings yet for this client.</p>
            ) : (
              <>
                {/* Aggregate summary */}
                <div style={{ marginBottom: 12 }}>
                  {(() => {
                    const count = clientRatings.length;
                    const avg =
                      count === 0
                        ? 0
                        : clientRatings.reduce((s, r) => s + (r.stars || 0), 0) / count;
                    const rounded = Math.round(avg * 10) / 10; // one decimal
                    return (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div>
                          <strong style={{ fontSize: 18 }}>{rounded}</strong>
                          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <FaStar
                                key={i}
                                color={i < Math.round(avg) ? "#f59e0b" : "#e5e7eb"}
                              />
                            ))}
                          </div>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>
                            {count} review{count > 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* List */}
                <div style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: 8 }}>
                  {clientRatings.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        marginBottom: 14,
                        borderBottom: "1px solid #eee",
                        paddingBottom: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {r.designerImage ? (
                          <img
                            src={r.designerImage}
                            alt={r.designerName}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 6,
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 6,
                              background: "#eee",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <FaUser />
                          </div>
                        )}
                        <div>
                          <strong>{r.reviewerName}</strong>
                          {r.designerName && (
                            <div style={{ fontSize: 12, color: "#6b7280" }}>
                              {r.designerName}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            marginLeft: "auto",
                            display: "flex",
                            gap: 4,
                            alignItems: "center",
                          }}
                        >
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar
                              key={i}
                              color={i < r.stars ? "#f59e0b" : "#e5e7eb"}
                            />
                          ))}
                        </div>
                      </div>

                      {r.review ? (
                        <p style={{ marginTop: 8, fontStyle: "italic" }}>
                          “{r.review}”
                        </p>
                      ) : (
                        <p style={{ marginTop: 8, color: "#6b7280" }}>No comment</p>
                      )}

                      <small style={{ color: "#9ca3af" }}>
                        {formatDate(r.createdAt)}
                      </small>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
              <button className="lux-btn decline" onClick={closeClientRatings}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default DesignerWorkReceived;
