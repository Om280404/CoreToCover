import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import NotificationButton from "./NotificationButton";
import "./SellerProducts.css";
import { FaStar, FaRegStar } from "react-icons/fa";

import {
  getSellerProducts,
  updateSellerProduct,
  deleteSellerProduct,
  getProductRatings,
} from "../../api/seller";

/* ===============================
   AVAILABILITY FORMATTER
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

const SellerProducts = () => {
  const [materials, setMaterials] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState({});

  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    productType: "",
    price: "",
    description: "",
    availability: "available",
    existingImages: [],
    removedImages: [],
    newImageFiles: [],
    newImagePreviews: [],
  });

  /* =========================
     REVIEWS STATE (🔥 KEPT)
  ========================= */
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ratingData, setRatingData] = useState({
    avgRating: 0,
    count: 0,
    reviews: [],
  });

  const renderStars = (rating = 0) => {
    const rounded = Math.round(rating);
    return [...Array(5)].map((_, i) =>
      i < rounded ? <FaStar key={i} /> : <FaRegStar key={i} />
    );
  };

  /* =========================
     FETCH SELLER PRODUCTS
  ========================= */
  useEffect(() => {
    const sellerId = localStorage.getItem("sellerId");
    if (!sellerId) {
      setLoading(false);
      return;
    }

    getSellerProducts(sellerId)
      .then((res) => {
        setMaterials(Array.isArray(res.data) ? res.data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  /* =========================
     IMAGE SLIDESHOW
  ========================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => {
        const updated = { ...prev };
        materials.forEach((m) => {
          const len = m.images?.length || 1;
          updated[m.id] = ((updated[m.id] || 0) + 1) % len;
        });
        return updated;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [materials]);

  /* =========================
     EDIT START
  ========================= */
  const startEdit = (m) => {
    setEditingId(m.id);
    setEditForm({
      name: m.name,
      category: m.category,
      productType: m.productType,
      price: m.price,
      description: m.description || "",
      availability: m.availability || "available",
      existingImages: (m.images || []).map(
        (img) => `http://localhost:3001/${img}`
      ),
      removedImages: [],
      newImageFiles: [],
      newImagePreviews: [],
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => setEditingId(null);

  /* =========================
     FORM HANDLERS
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setEditForm((p) => ({
      ...p,
      newImageFiles: [...p.newImageFiles, ...files],
      newImagePreviews: [
        ...p.newImagePreviews,
        ...files.map((f) => URL.createObjectURL(f)),
      ],
    }));
  };

  const removeExistingImage = (img) => {
    setEditForm((p) => ({
      ...p,
      existingImages: p.existingImages.filter((i) => i !== img),
      removedImages: [...p.removedImages, img],
    }));
  };

  const removeNewImage = (index) => {
    setEditForm((p) => ({
      ...p,
      newImageFiles: p.newImageFiles.filter((_, i) => i !== index),
      newImagePreviews: p.newImagePreviews.filter((_, i) => i !== index),
    }));
  };

  /* =========================
     SAVE EDIT (API)
  ========================= */
  const saveEdit = async () => {
    try {
      const formData = new FormData();

      formData.append("name", editForm.name);
      formData.append("category", editForm.category);
      formData.append("productType", editForm.productType);
      formData.append("price", editForm.price);
      formData.append("description", editForm.description);
      formData.append("availability", editForm.availability);

      const keptImages = editForm.existingImages.map((img) =>
        img.replace("http://localhost:3001/", "")
      );
      formData.append("existingImages", JSON.stringify(keptImages));

      editForm.newImageFiles.forEach((file) =>
        formData.append("images", file)
      );

      const res = await updateSellerProduct(editingId, formData);

      setMaterials((prev) =>
        prev.map((p) => (p.id === editingId ? res.data.product : p))
      );

      cancelEdit();
    } catch (err) {
      console.error(err);
      alert("Server error while updating product");
    }
  };

  /* =========================
     DELETE PRODUCT
  ========================= */
  const removeMaterial = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteSellerProduct(productId);
      setMaterials((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      alert("Failed to delete product");
    }
  };

  /* =========================
     LOAD REVIEWS (🔥 KEPT)
  ========================= */
  const loadReviews = async (product) => {
    setSelectedProduct(product);

    try {
      const res = await getProductRatings(product.id);
      setRatingData({
        avgRating: res.data.avgRating || 0,
        count: res.data.count || 0,
        reviews: res.data.reviews || [],
      });
    } catch {
      setRatingData({ avgRating: 0, count: 0, reviews: [] });
    }
  };

  return (
    <div className="ms-root">
      <Sidebar />
      <NotificationButton />

      <main className="ms-main">
        <header className="ms-header">
          <h1 className="ms-title">My Products</h1>
          <p className="ms-sub">
            {loading ? "Loading…" : "Manage your listed products"}
          </p>
        </header>

        {/* =========================
            REVIEWS PANEL (🔥 KEPT)
        ========================= */}
        {selectedProduct && (
          <aside className="ms-reviews-panel">
            <h3 className="ms-reviews-title">
              Reviews – {selectedProduct.name}
            </h3>

            <div className="ms-rating-summary">
              <div className="ms-stars">
                {renderStars(ratingData.avgRating)}
              </div>
              <span className="ms-rating-number">
                {ratingData.avgRating.toFixed(1)}
              </span>
              <span className="ms-rating-count">
                ({ratingData.count} ratings)
              </span>
            </div>

            <div className="ms-reviews-list">
              {ratingData.reviews.length === 0 ? (
                <p className="ms-no-reviews">No reviews yet</p>
              ) : (
                ratingData.reviews.map((r) => (
                  <div key={r.id} className="ms-review-card">
                    <div className="ms-stars">
                      {renderStars(r.stars)}
                    </div>
                    <p className="ms-review-user">{r.user}</p>
                    <p className="ms-review-text">
                      {r.comment || "No comment"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* =========================
            PRODUCTS GRID
        ========================= */}
        <section className="ms-grid">
          {materials.length === 0 ? (
            <div className="ms-empty">No products added</div>
          ) : (
            materials.map((m) => (
              <article key={m.id} className="ms-card">
                <img
                  src={
                    m.images?.length
                      ? `http://localhost:3001/${m.images[slideIndex[m.id] || 0]}`
                      : ""
                  }
                  className="ms-thumb"
                  alt={m.name}
                />

                <div className="ms-body">
                  <h3 className="ms-name">{m.name}</h3>
                  <div className="ms-price">
                    ₹{Number(m.price).toLocaleString()}
                  </div>

                  <div className={`ms-meta stock-${m.availability}`}>
                    Status: <strong>{formatAvailability(m.availability)}</strong>
                  </div>
                </div>

                <div className="ms-actions">
                  <button
                    className="ms-btn ms-btn--outline"
                    onClick={() => startEdit(m)}
                  >
                    Edit
                  </button>
                  <button
                    className="ms-btn ms-btn--ghost"
                    onClick={() => removeMaterial(m.id)}
                  >
                    Remove
                  </button>
                  <button
                    className="ms-btn ms-btn--ghost"
                    onClick={() => loadReviews(m)}
                  >
                    View Reviews
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default SellerProducts;
