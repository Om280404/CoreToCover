import React, { useState, useMemo, useEffect } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Product_Info.css";
import sample from "../../assets/images/sample.jpg";
import { addToCart } from "../../utils/cart";

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

const ProductInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product || {};

  const {
    id,
    sellerId,
    title = "Product Detail",
    seller = "Reliable Seller",
    origin = "India",
    price = 0,
    images = [],
    description = "No description available.",
    availability = "available",
  } = product;

  const [quantity, setQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);

  /* ⭐ RATING STATE */
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [reviews, setReviews] = useState([]);

  /* =========================
     FETCH RATINGS
  ========================= */
  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:3001/product/${id}/ratings`)
      .then((res) => res.json())
      .then((data) => {
        setAvgRating(data.avgRating || 0);
        setRatingCount(data.count || 0);
        setReviews(data.reviews || []);
      })
      .catch(() => {
        setAvgRating(0);
        setRatingCount(0);
        setReviews([]);
      });
  }, [id]);

  const imageList = images.length ? images : [sample];
  const [activeImage, setActiveImage] = useState(imageList[0]);

  const totalPrice = useMemo(() => price * quantity, [price, quantity]);

  const isUnavailable =
    availability === "out_of_stock" ||
    availability === "discontinued";

  const handleAddToCart = () => {
    if (isUnavailable) return alert("Unavailable");

    addToCart({
      materialId: id,
      supplierId: sellerId,
      name: title,
      supplier: seller,
      amountPerTrip: price,
      trips: quantity,
      image: activeImage,
    });

    alert("Added to cart");
  };

  const handleBuyNow = () => {
    if (isUnavailable) return alert("Unavailable");

    localStorage.setItem(
      "singleCheckoutItem",
      JSON.stringify({
        materialId: id,
        supplierId: sellerId,
        name: title,
        supplier: seller,
        amountPerTrip: price,
        trips: quantity,
        image: activeImage,
      })
    );

    navigate("/checkout");
  };

  if (!id || !sellerId) {
    return (
      <>
        <Navbar />
        <div className="pd-container">
          <h1 className="pd-title" style={{ padding: 80 }}>
            Product details missing
          </h1>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="pd-container">
        {/* LEFT */}
        <div className="pd-left">
          <div className="pd-thumbnails">
            {imageList.map((img, i) => (
              <img
                key={i}
                src={img}
                className={`pd-thumb ${activeImage === img ? "active" : ""}`}
                onClick={() => setActiveImage(img)}
              />
            ))}
          </div>

          <div className="pd-image-box">
            <img src={activeImage} className="pd-image" />
          </div>
        </div>

        {/* CENTER */}
        <div className="pd-center">
          <h1 className="pd-title">{title}</h1>

          <div className="pd-rating-line">
            <div className="pd-stars">{renderStars(avgRating)}</div>
            <span className="pd-rating-count">
              {avgRating || "No ratings"} {ratingCount > 0 && `(${ratingCount})`}
            </span>
          </div>

          <div
            className={`pd-description ${expanded ? "expanded" : "collapsed"}`}
          >
            {description}
          </div>

          {description.length > 120 && (
            <span
              className="pd-see-more"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "See less" : "See more"}
            </span>
          )}



          <hr className="pd-divider" />

          <div className="pd-key-details">
            <p><strong>Seller:</strong> {seller}</p>
            <p><strong>Origin:</strong> {origin}</p>
            <p><strong>Status:</strong> {formatAvailability(availability)}</p>
          </div>

          <hr className="pd-divider" />

        </div>

        {/* RIGHT */}
        <div className="pd-right">
          <div className="pd-buybox">
            <p className="pd-buybox-title">{title}</p>
            <p className="pd-price">₹{totalPrice.toLocaleString()}</p>

            <button
              className="pd-btn pd-btn-buy"
              onClick={handleBuyNow}
              disabled={isUnavailable}
            >
              🛒 Buy Now
            </button>

            <button
              className="pd-btn pd-btn-cart"
              onClick={handleAddToCart}
              disabled={isUnavailable}
            >
              ➕ Add to Cart
            </button>

            <button
              className="pd-btn pd-btn-back"
              onClick={() => navigate(-1)}
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
      {/* =========================
     REVIEWS SECTION (BOTTOM)
========================= */}
      <section className="pd-reviews-section">
        <h2 className="pd-reviews-title">
          Customer Reviews
          {ratingCount > 0 && (
            <span className="pd-reviews-count">
              ({ratingCount})
            </span>
          )}
        </h2>

        {reviews.length === 0 ? (
          <p className="pd-no-reviews">
            No reviews yet. Be the first to review this product.
          </p>
        ) : (
          <div className="pd-reviews-list">
            {reviews.map((r) => (
              <div key={r.id} className="pd-review-card">
                <div className="pd-review-header">
                  <strong className="pd-review-user">{r.user}</strong>
                  <div className="pd-stars">
                    {renderStars(r.stars)}
                  </div>
                </div>

                {r.comment && (
                  <p className="pd-review-comment">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

    </>
  );
};

export default ProductInfo;
