import React, { useState, useMemo, useEffect } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { PiVideoFill } from "react-icons/pi";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Product_Info.css";
import sample from "../../assets/images/sample.jpg";
import { addToCart } from "../../utils/cart";
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
    video = null,
    description = "No description available.",
    availability = "available",
  } = product;

  /* =========================
     SEE MORE STATE
  ========================= */
  const [showFullDesc, setShowFullDesc] = useState(false);

  /* =========================
     MEDIA NORMALIZATION
  ========================= */
  const mediaList = useMemo(() => {
    const list = [];

    const imageArray = images.length ? images : [sample];
    imageArray.forEach((img) =>
      list.push({ type: "image", src: img })
    );

    if (video) {
      const videoUrl = video.startsWith("http")
        ? video
        : `http://localhost:3001/${video}`;
      list.push({ type: "video", src: videoUrl });
    }

    return list;
  }, [images, video]);

  const [activeMedia, setActiveMedia] = useState(null);

  useEffect(() => {
    if (mediaList.length) setActiveMedia(mediaList[0]);
  }, [mediaList]);

  /* =========================
     RATINGS
  ========================= */
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!id) return;

    api.get(`/product/${id}/ratings`)
      .then((res) => {
        setAvgRating(res.data.avgRating || 0);
        setRatingCount(res.data.count || 0);
        setReviews(res.data.reviews || []);
      })
      .catch(() => {
        setAvgRating(0);
        setRatingCount(0);
        setReviews([]);
      });
  }, [id]);

  const quantity = 1;
  const totalPrice = price * quantity;

  const isUnavailable =
    availability === "out_of_stock" ||
    availability === "discontinued";

  /* =========================
     CART ACTIONS
  ========================= */
  const handleAddToCart = () => {
    if (isUnavailable) return alert("Unavailable");

    addToCart({
      materialId: id,
      supplierId: sellerId,
      name: title,
      supplier: seller,
      amountPerTrip: price,
      trips: quantity,
      image: activeMedia?.src,
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
        image: activeMedia?.src,
      })
    );

    navigate("/checkout");
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;

    const shareData = {
      title: title,
      text: `Check out this product on Casa`,
      url: shareUrl,
    };

    // Web Share API (mobile + supported browsers)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share cancelled", err);
      }
    } else {
      // Fallback: copy link
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Product link copied to clipboard!");
      } catch (err) {
        alert("Unable to copy link");
      }
    }
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
            {mediaList.map((item, i) =>
              item.type === "video" ? (
                <div
                  key={i}
                  className={`pd-thumb video-thumb ${activeMedia?.src === item.src ? "active" : ""}`}
                  onClick={() => setActiveMedia(item)}
                >
                  <PiVideoFill />
                </div>
              ) : (
                <img
                  key={i}
                  src={item.src}
                  className={`pd-thumb ${activeMedia?.src === item.src ? "active" : ""}`}
                  onClick={() => setActiveMedia(item)}
                  alt=""
                />
              )
            )}
          </div>

          <div className="pd-image-box">
            {activeMedia?.type === "video" ? (
              <video
                src={activeMedia.src}
                controls
                controlsList="nodownload noplaybackrate noremoteplayback"
                autoPlay
                style={{ width: "100%", height: "100%", background: "#000" }}
              />
            ) : (
              <img
                src={activeMedia?.src}
                alt=""
                className="pd-image"
                onError={(e) => (e.target.src = sample)}
              />
            )}
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

          {/* ✅ DESCRIPTION WITH SEE MORE */}
          {/* DESCRIPTION */}
          <div
            className={`pd-description ${showFullDesc ? "expanded" : "collapsed"
              }`}
          >
            {description}
          </div>

          {description.length > 150 && (
            <span
              className="pd-see-more"
              onClick={() => setShowFullDesc((prev) => !prev)}
            >
              {showFullDesc ? "See less" : "See more"}
            </span>
          )}


          <hr className="pd-divider" />

          <div className="pd-key-details">
            <p><strong>Seller:</strong> {seller}</p>
            <p><strong>Origin:</strong> {origin}</p>
            <p><strong>Status:</strong> {formatAvailability(availability)}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="pd-right">
          <div className="pd-buybox">
            <p className="pd-buybox-title">{title}</p>
            <p className="pd-price">₹{totalPrice.toLocaleString()}</p>

            <button className="pd-btn pd-btn-buy" onClick={handleBuyNow} disabled={isUnavailable}>
              🛒 Buy Now
            </button>

            <button className="pd-btn pd-btn-cart" onClick={handleAddToCart} disabled={isUnavailable}>
              ➕ Add to Cart
            </button>

            <button className="pd-btn pd-btn-back" onClick={() => navigate(-1)}>
              ← Go Back
            </button>

            <button className="pd-btn pd-btn-share" onClick={handleShare}>
              🔗 Share
            </button>

          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <section className="pd-reviews-section">
        <h2 className="pd-reviews-title">
          Customer Reviews {ratingCount > 0 && <span>({ratingCount})</span>}
        </h2>

        {reviews.length === 0 ? (
          <p className="pd-no-reviews">No reviews yet.</p>
        ) : (
          <div className="pd-reviews-list">
            {reviews.map((r) => (
              <div key={r.id} className="pd-review-card">
                <strong>{r.user}</strong>
                <div className="pd-stars">{renderStars(r.stars)}</div>
                {r.comment && <p>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default ProductInfo;
