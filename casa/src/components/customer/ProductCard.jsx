import React from "react";
import "./ProductCard.css";
import { useNavigate } from "react-router-dom";
import Sample from "../../assets/images/sample.jpg";

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
  availability = "available", // ✅ NEW
}) => {
  const navigate = useNavigate();

  const finalImage = image || Sample;

  const priceDisplay =
    price > 0 ? price.toLocaleString() : "Contact for Price";

  const truncatedDescription =
    description?.length > 70
      ? description.substring(0, 70) + "..."
      : description;

  return (
    <article className="product-card">
      <div className="product-image-container">
        <img
          src={finalImage}
          alt={title}
          className="product-image"
        />
        <span className="product-badge">{category}</span>
      </div>

      <div className="product-info">
        <h3 className="product-title">{title}</h3>

        <p className="product-description">
          {truncatedDescription}
        </p>

        <div className="product-meta-row">
          <span className="product-meta">
            Seller: {seller}
          </span>
          <span className="product-meta">
            Location: {origin}
          </span>
        </div>

        {/* ✅ Availability shown using existing meta */}
        <div className="product-meta-row">
          <span className="product-meta">
            Status: <strong>{formatAvailability(availability)}</strong>
          </span>
        </div>

        <div className="product-price">
          <span className="price-value">
            ₹{priceDisplay}
          </span>
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
                  availability, // ✅ PASS TO DETAILS PAGE
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
