import React, { useEffect, useState } from "react";
import "./ProductCard.css";
import { useNavigate } from "react-router-dom";
import Sample from "../../assets/images/sample.jpg";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import api from "../../api/axios";

/* ===============================
   HELPERS
=============================== */
const formatAvailability = (value) => {
  switch (value) {
    case "available":
      return "Available";
    case "out_of_stock":
      return "Out of Stock";
    case "low_stock":
      return "Low Stock";
    case "discontinued":
      return "Discontinued";
    default:
      return "Available";
  }
};

const renderStars = (rating = 0) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= full) stars.push(<FaStar key={i} aria-hidden="true" />);
    else if (i === full + 1 && half)
      stars.push(<FaStarHalfAlt key={i} aria-hidden="true" />);
    else stars.push(<FaRegStar key={i} aria-hidden="true" />);
  }
  return stars;
};

/* safe base for images — prefer environment variable */
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";


const ProductCard = ({
  id,
  sellerId,
  title = "Untitled",
  category = "",
  description = "",
  price = null,
  images = [],
  seller = null,
  origin = null,
  availability = "available",
  video = null,
  entityType = "product", // "product" | "designer" | "raw_material"
}) => {
  const navigate = useNavigate();

  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    if (!id) return;

    // Choose rating endpoint depending on entity type
    const endpoint =
      entityType === "designer" ? `/designer/${id}/ratings` : `/product/${id}/ratings`;

    api.get(endpoint)
      .then((res) => {
        if (entityType === "designer") {
          setAvgRating(res.data?.average || 0);   // ✅ FIX
          setRatingCount(res.data?.count || 0);
        } else {
          setAvgRating(res.data?.avgRating || 0);
          setRatingCount(res.data?.count || 0);
        }
      })

      .catch(() => {
        setAvgRating(0);
        setRatingCount(0);
      });
  }, [id, entityType]);

  /* IMAGE FIX + safe URL building */
  const rawCover = images && images.length ? images[0] : null;

  const coverImage = rawCover
    ? rawCover.startsWith("http")
      ? rawCover
      : `${API_BASE}/${rawCover.replace(/^\/+/, "")}`
    : Sample;

  const handleImageError = (e) => {
    e.currentTarget.src = Sample;
  };

  const handleViewDetails = () => {
    if (entityType === "designer") {
      navigate(`/designer_info?id=${id}`, {
        state: { designer: { id, title, seller, origin, images, description } },
      });
    } else {
      navigate(`/productinfo?id=${id}`, {
        state: {
          product: {
            id,
            sellerId,
            title,
            seller,
            origin,
            price,
            images,
            video,
            description,
            availability,
            category,
          },
        },
      });
    }
  };

  return (
    <article className="product-card" aria-labelledby={`card-title-${id}`}>
      <div className="product-image-container">
        <img
          src={coverImage}
          alt={title}
          className="product-image"
          loading="lazy"
          onError={handleImageError}
        />
        {category && <span className="product-badge">{category}</span>}
      </div>

      <div className="product-info">
        <h3 id={`card-title-${id}`} className="product-title">
          {title}
        </h3>

        <div className="product-rating" aria-label={`Rating ${avgRating} out of 5`}>
          {renderStars(avgRating)}
          <span className="rating-text">
            {avgRating ? avgRating.toFixed(1) : "No ratings"}
            {ratingCount > 0 && ` (${ratingCount})`}
          </span>
        </div>

        <div className="product-meta-row">
          {entityType === "designer" ? (
            <>
              {/* Bio */}
              <p className="product-description">
                {description || "Designer profile"}
              </p>

              {/* Designer name */}
              <span className="product-name">
                Designer: <strong>{title}</strong>
              </span>

              {/* Location */}
              <span className="product-meta">
                Location: {origin || "Not specified"}
              </span>
            </>
          ) : (

            <>
              <p className="product-description">Description: {description || "—"}</p>

              <span className="product-meta">
                Seller: {typeof seller === "string" ? seller : seller?.name || "Not specified"}
              </span>

              <span className="product-meta">
                Location: {origin || (seller?.business ? `${seller.business.city}, ${seller.business.state}` : "Not specified")}
              </span>
            </>
          )}
        </div>

        {availability && (
          <div className="product-meta-row">
            Status: <strong>
              {entityType === "designer"
                ? availability
                : formatAvailability(availability)}
            </strong>
          </div>
        )}


        <div className="product-price" aria-hidden={price == null}>
          {price != null ? `₹${Number(price).toLocaleString()}` : entityType === "designer" ? "" : "Price on request"}
        </div>

        <button
          className="product-btn"
          onClick={handleViewDetails}
          aria-label={`View details of ${title}`}
        >
          View Details
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
