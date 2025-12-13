import React, { useState, useMemo } from "react";
import { FaStar } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Product_Info.css";
import sample from "../../assets/images/sample.jpg";
import { addToCart } from "../../utils/cart"; // ✅ KEEP cart backend

const ProductInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [quantity, setQuantity] = useState(1);
  const [expanded, setExpanded] = useState(false);

  /* =========================================
     PRODUCT DATA FROM NAVIGATION
  ========================================= */
  const product = location.state?.product || {};

  const {
    id,
    sellerId,
    title = "Product Detail",
    seller = "Reliable Seller",
    origin = "Pune, Maharashtra",
    price = 1000,
    images = [],
    description = "No description available.",
  } = product;



  /* =========================================
     IMAGE HANDLING (Frontend-safe)
  ========================================= */
  const imageList =
    images.length > 0
      ? images
      : [sample];

  const [activeImage, setActiveImage] = useState(imageList[0]);

  /* =========================================
     DESCRIPTION LOGIC
  ========================================= */
  const maxLength = 180;
  const isLong = description.length > maxLength;
  const shortText = description.slice(0, maxLength);

  /* =========================================
     PRICE CALCULATION
  ========================================= */
  const totalPrice = useMemo(
    () => price * quantity,
    [price, quantity]
  );

  /* =========================================
     CART HANDLER (BACKEND KEPT)
  ========================================= */
  const handleAddToCart = () => {
    addToCart({
      materialId: id,               // ✅ REQUIRED
      supplierId: sellerId,         // ✅ REQUIRED
      name: title,
      supplier: seller,
      amountPerTrip: price,         // ✅ REQUIRED
      trips: quantity,              // ✅ REQUIRED
      amount: price * quantity,     // ✅ REQUIRED
      image: activeImage,
      delivery: "Delivery in 1–2 days",
    });

    alert(`${quantity} item(s) of ${title} added to cart!`);
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
            style={{ padding: "80px 5vw", textAlign: "center" }}
          >
            Product details missing. Please go back and try again.
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
                className={`pd-thumb ${activeImage === img ? "active" : ""}`}
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
            {expanded || !isLong
              ? description
              : `${shortText}...`}
            {isLong && (
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
            <span className="pd-rating-count">
              5.0 ★ | 235 Ratings
            </span>
          </div>

          <hr className="pd-divider" />

          <div className="pd-key-details">
            <p><strong>Seller:</strong> {seller}</p>
            <p><strong>Origin:</strong> {origin}</p>
          </div>

          <hr className="pd-divider" />

          <div className="pd-price-block">
            <p className="pd-final-price">
              ₹{totalPrice.toLocaleString()}
            </p>
            <p className="pd-tax-info">
              Inclusive of all taxes
            </p>
          </div>

          <div className="pd-trips">
            <span className="pd-trips-label">Quantity:</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
            <span className="pd-trip-count">{quantity}</span>
            <button
              onClick={() =>
                quantity > 1 && setQuantity(quantity - 1)
              }
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
              onClick={() =>
                navigate("/checkout", {
                  state: {
                    products: [
                      {
                        id,
                        sellerId,
                        title,
                        price,
                        quantity,
                        amount: totalPrice,
                        image: activeImage,
                      },
                    ],
                  },
                })
              }
            >
              🛒 Buy Now
            </button>

            <button
              className="pd-btn pd-btn-cart"
              onClick={handleAddToCart}
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
