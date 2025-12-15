import React from "react";
import "./ProductCard.css";
import { useNavigate } from "react-router-dom";
import Sample from "../../assets/images/sample.jpg";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const formatAvailability = (value) => {
  switch (value) {
    case "available": return "Available";
    case "out_of_stock": return "Out of Stock";
    case "low_stock": return "Low Stock";
    case "discontinued": return "Discontinued";
    default: return "Available";
  }
};

const renderStars = (rating) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= full) stars.push(<FaStar key={i} />);
    else if (i === full + 1 && half)
      stars.push(<FaStarHalfAlt key={i} />);
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
  image,
  images = [],
  seller,
  origin,
  availability = "available",
  avgRating = 0,
  ratingCount = 0,
}) => {
  const navigate = useNavigate();
  const finalImage = image || Sample;

  return (
    <article className="product-card">
      <div className="product-image-container">
        <img src={finalImage} alt={title} className="product-image" />
        <span className="product-badge">{category}</span>
      </div>

      <div className="product-info">
        <h3 className="product-title">{title}</h3>

        {/* ⭐ RATING */}
        <div className="product-rating">
          {renderStars(avgRating)}
          <span className="rating-text">
            {avgRating > 0 ? avgRating : "No ratings"}
            {ratingCount > 0 && ` (${ratingCount})`}
          </span>
        </div>

        <p className="product-description" title={description}>
          {description}
        </p>


        <div className="product-meta-row">
          <span className="product-meta">Seller: {seller}</span>
          <span className="product-meta">Location: {origin}</span>
        </div>

        <div className="product-meta-row">
          <span className="product-meta">
            Status: <strong>{formatAvailability(availability)}</strong>
          </span>
        </div>

        <div className="product-price">
          <span className="price-value">₹{price.toLocaleString()}</span>
          <span className="price-unit">/unit</span>
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
