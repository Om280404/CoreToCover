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
    case "available": return "Available";
    case "out_of_stock": return "Out of Stock";
    case "low_stock": return "Low Stock";
    case "discontinued": return "Discontinued";
    default: return "Available";
  }
};

const renderStars = (rating = 0) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= full) stars.push(<FaStar key={i} />);
    else if (i === full + 1 && half) stars.push(<FaStarHalfAlt key={i} />);
    else stars.push(<FaRegStar key={i} />);
  }
  return stars;
};

const ProductCard = ({
  id,
  sellerId,
  title,
  category,
  description,
  price,
  images = [],
  seller,
  origin,
  availability = "available",
  video,
}) => {
  const navigate = useNavigate();

  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    if (!id) return;

    api.get(`/product/${id}/ratings`)
      .then((res) => {
        setAvgRating(res.data.avgRating || 0);
        setRatingCount(res.data.count || 0);
      })
      .catch(() => {
        setAvgRating(0);
        setRatingCount(0);
      });
  }, [id]);

  const coverImage = images.length ? images[0] : Sample;

  return (
    <article className="product-card">
      <div className="product-image-container">
        <img src={coverImage} alt={title} className="product-image" />
        <span className="product-badge">{category}</span>
      </div>

      <div className="product-info">
        <h3 className="product-title">{title}</h3>

        <div className="product-rating">
          {renderStars(avgRating)}
          <span className="rating-text">
            {avgRating ? avgRating.toFixed(1) : "No ratings"}
            {ratingCount > 0 && ` (${ratingCount})`}
          </span>
        </div>

        <p className="product-description">{description}</p>

        <div className="product-meta-row">
          <span className="product-meta">Seller: {seller}</span>
          <span className="product-meta">Location: {origin}</span>
        </div>

        <div className="product-meta-row">
          Status: <strong>{formatAvailability(availability)}</strong>
        </div>

        <div className="product-price">
          ₹{price.toLocaleString()}
        </div>

        <button
          className="product-btn"
          onClick={() =>
            navigate("/productinfo", {
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
                },
              },
            })
          }
        >
          View Details
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
