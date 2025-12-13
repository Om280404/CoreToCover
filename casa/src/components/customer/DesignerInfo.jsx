import React, { useState } from "react";
import "./DesignerInfo.css";
import Navbar from "./Navbar";
import { FaPhoneAlt, FaArrowLeft, } from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
const sampleWorks = [
  { id: 1, 
    img: "https://images.pexels.com/photos/6588580/pexels-photo-6588580.jpeg", 
    title: "Modern Living Room", 
    desc: "Warm tones + natural lighting" 
},
  { id: 2, 
    img: "https://images.pexels.com/photos/3965520/pexels-photo-3965520.jpeg", 
    title: "Minimal Bedroom", 
    desc: "Soft textures + clean palette" 
},
  { id: 3, 
    img: "https://images.pexels.com/photos/6588582/pexels-photo-6588582.jpeg", 
    title: "Wood Furniture Concept", 
    desc: "Elegant wooden form study" 
},
  { id: 4, 
    img: "https://images.pexels.com/photos/2754845/pexels-photo-2754845.jpeg", 
    title: "Product Design Prototype", 
    desc: "Clean industrial design. Clean industrial design." 
},
];

/* Reusable Expandable Text */
const ExpandableText = ({ text = "", limit = 160 }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > limit;
  const shortText = text.slice(0, limit);
  return (
    <p className="expandable-text">
      {expanded || !isLong ? text : `${shortText}...`}
      {isLong && (
        <span className="see-more-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? " See less" : " See more"}
        </span>
      )}
    </p>
  );
};

const DesignerInfo = () => {
  const [activeImage, setActiveImage] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // <-- Replace this with real value from API when available
  const [isAvailable] = useState(true); // true = Available, false = Busy

  return (
    <>
      <Navbar />
      <div className="designer-info-page">
        <button className="back-btn" onClick={() => window.history.back()}>
          <FaArrowLeft /> Back
        </button>

        <div className="designer-info-layout">
          {/* LEFT — Designer Info */}
          <div className="designer-text">
            <img
              src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
              alt="designer"
              className="designer-photo"
            />

            <div className="title-row">
              <h1 className="designer-name">Aanya Deshmukh</h1>

              {/* Availability pill */}
              <div
                className={`availability-pill ${isAvailable ? "available" : "busy"}`}
                aria-live="polite"
                title={isAvailable ? "Currently accepting projects" : "Currently busy / not accepting projects"}
              >
                <span className="dot" aria-hidden="true" />
                {isAvailable ? "Available" : "Busy"}
              </div>
            </div>

            <h3 className="designer-role">Interior & Product Designer</h3>
            <p className="designer-location"><LuMapPin/> Pune, Maharashtra</p>

            <ExpandableText
              text="5+ years of experience crafting premium modern interiors and functional product designs. Known for clean aesthetics and nature-inspired forms."
              limit={160}
            />

            <span className="pd-rating-count">5.0 ★ | 235 Ratings</span>


            {/* <p className="designer-contact">
              <FaPhoneAlt className="phone-icon" /> +91 98765 43210
            </p> */}

            <p className="designer-contact">Portfolio Link:</p>

            {/* If designer busy -> disable button */}
            <button
              className={`hire-btn ${!isAvailable ? "disabled" : ""}`}
              onClick={() => isAvailable && setShowForm(true)}
              disabled={!isAvailable}
              aria-disabled={!isAvailable}
              title={!isAvailable ? "Designer is currently busy" : "Hire this designer"}
            >
              {isAvailable ? "Hire This Designer" : "Currently Unavailable"}
            </button>
          </div>

          {/* RIGHT — Big Image */}
          <div className="designer-main-image">
            <img src={activeImage || sampleWorks[0].img} alt="large" />
          </div>
        </div>

        {/* WORK EXPERIENCE SECTION */}
        <div className="portfolio-section">
          <h2 className="portfolio-title">Aanya's Work Experience</h2>

          <div className="portfolio-row">
            {sampleWorks.map((work) => (
              <div key={work.id} className="portfolio-item" onClick={() => setActiveImage(work.img)}>
                <img src={work.img} alt={work.title} />
                <ExpandableText text={`${work.title} — ${work.desc}`} limit={100} />
              </div>
            ))}
          </div>
        </div>

        {/* HIRE FORM POPUP */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h2 className="modal-title">Hire This Designer</h2>
              <p className="modal-sub">Fill the details to send your project request.</p>

              <form
                className="modal-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Request Sent Successfully!");
                  setShowForm(false);
                }}
              >
                <label>Full Name<input type="text" required /></label>
                <label>Mobile Number<input type="tel" required /></label>
                <label>Email<input type="email" required /></label>
                <label>City / Location<input type="text" required /></label>
                <label>Budget in Rs<input type="number" required /></label>
                

                <label>
                  Type of Work
                  <select required>
                    <option>Select type</option>
                    <option>Interior Design</option>
                    <option>Product Design</option>
                    <option>Renovation</option>
                    <option>Furniture Design</option>
                  </select>
                </label>

                <label>Estimated Timeline<input type="number" placeholder="in days" required /></label>

                <label className="desc">
                  Project Description
                  <textarea rows="3" />
                </label>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">Send Request</button>
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
