import React, { useState, useMemo } from "react";
import { FaStar } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Product_Info.css";
import sample from "../../assets/images/sample.jpg";
import { addToCart } from "../../utils/cart";

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

const ProductInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* =========================================
     PRODUCT DATA FROM NAVIGATION
  ========================================= */
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
    availability = "available", // ✅ NEW
  } = product;

  const [quantity, setQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);

  /* =========================================
     IMAGE HANDLING
  ========================================= */
  const imageList = images.length > 0 ? images : [sample];
  const [activeImage, setActiveImage] = useState(imageList[0]);

  /* =========================================
     PRICE
  ========================================= */
  const totalPrice = useMemo(
    () => price * quantity,
    [price, quantity]
  );

  const isUnavailable =
    availability === "out_of_stock" ||
    availability === "discontinued";

  /* =========================================
     ADD TO CART
  ========================================= */
  const handleAddToCart = () => {
    if (isUnavailable) {
      alert("This product is currently unavailable");
      return;
    }

    addToCart({
      materialId: id,
      supplierId: sellerId,
      name: title,
      supplier: seller,
      amountPerTrip: price,
      trips: quantity,
      amount: price * quantity,
      image: activeImage,
    });

    alert("Product added to cart");
  };

  /* =========================================
     BUY NOW
  ========================================= */
  const handleBuyNow = () => {
    if (isUnavailable) {
      alert("This product is currently unavailable");
      return;
    }

    const singleItem = {
      materialId: id,
      supplierId: sellerId,
      name: title,
      supplier: seller,
      amountPerTrip: price,
      trips: quantity,
      amount: price * quantity,
      image: activeImage,
    };

    localStorage.setItem(
      "singleCheckoutItem",
      JSON.stringify(singleItem)
    );

    navigate("/checkout");
  };

  /* =========================================
     FALLBACK
  ========================================= */
  if (!id || !sellerId) {
    return (
      <>
        <Navbar />
        <div className="pd-container">
          <h1
            className="pd-title"
            style={{ padding: "80px", textAlign: "center" }}
          >
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
        {/* LEFT IMAGE */}
        <div className="pd-left">
          <div className="pd-thumbnails">
            {imageList.map((img, index) => (
              <img
                key={index}
                src={img}
                alt="thumb"
                className={`pd-thumb ${
                  activeImage === img ? "active" : ""
                }`}
                onClick={() => setActiveImage(img)}
              />
            ))}
          </div>

          <div className="pd-image-box">
            <img
              src={activeImage}
              alt={title}
              className="pd-image"
            />
          </div>
        </div>

        {/* CENTER */}
        <div className="pd-center">
          <h1 className="pd-title">{title}</h1>

          <p className="pd-description">
            {expanded ? description : `${description.slice(0, 180)}...`}
            {description.length > 180 && (
              <span
                className="pd-see-more"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? " See less" : " See more"}
              </span>
            )}
          </p>

          <div className="pd-rating-line">
            <div className="pd-stars">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="pd-star" />
              ))}
            </div>
            <span className="pd-rating-count">5.0 ★</span>
          </div>

          <hr className="pd-divider" />

          <div className="pd-key-details">
            <p><strong>Seller:</strong> {seller}</p>
            <p><strong>Origin:</strong> {origin}</p>
            <p>
              <strong>Status:</strong>{" "}
              {formatAvailability(availability)}
            </p>
          </div>

          <hr className="pd-divider" />

          <div className="pd-price-block">
            <p className="pd-final-price">
              ₹{totalPrice.toLocaleString()}
            </p>
            <p className="pd-tax-info">Inclusive of all taxes</p>
          </div>

          <div className="pd-trips">
            <span className="pd-trips-label">Quantity:</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
            <span className="pd-trip-count">{quantity}</span>
            <button
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
            >
              -
            </button>
          </div>
        </div>

        {/* RIGHT BUY BOX */}
        <div className="pd-right">
          <div className="pd-buybox">
            <p className="pd-buybox-title">{title}</p>
            <p className="pd-price">
              ₹{totalPrice.toLocaleString()}
            </p>
            <p className="pd-tax">Inclusive of all taxes</p>

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
    </>
  );
};

export default ProductInfo;
