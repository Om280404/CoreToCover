import React from "react";
import "./ProductCard.css";
import { useNavigate } from "react-router-dom";
import Sample from "../../assets/images/sample.jpg";

const DesignerCard = ({
  id,
  name = "Designer Name",
  category = "General",
  description = "No description provided.",
  price = 0,
  image,
  designer = "Unknown Designer",
  origin = "Unknown Location",
}) => {
  const navigate = useNavigate();

  // ✅ Frontend-safe image handling
  const finalImage = image || Sample;

  const priceDisplay =
    price > 0 ? price.toLocaleString() : "Contact for Price";

  const truncatedDescription =
    description.length > 70
      ? description.substring(0, 70) + "..."
      : description;

  return (
    <article className="product-card">
      <div className="product-image-container">
        <img
          src={finalImage}
          alt={name}
          className="product-image"
        />
        <span className="product-badge">{category}</span>
      </div>

      <div className="product-info">
        <h3 className="product-title">{name}</h3>

        <p className="product-description">
          {truncatedDescription}
        </p>

        <div className="product-meta-row">
          <span className="product-meta">
            Designer: {designer}
          </span>
          <span className="product-meta">
            Location: {origin}
          </span>
        </div>

        <button
          className="product-btn"
          onClick={() =>
            navigate("/designer_info", {
              state: {
                designer: {
                  id,
                  name,
                  designer,
                  origin,
                  price,
                  image: finalImage,
                  description,
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

export default DesignerCard;
