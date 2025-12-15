import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import NotificationButton from "./NotificationButton";
import "./SellerProducts.css";
import { FaStar, FaRegStar } from "react-icons/fa";


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
    availability: "available", // ✅ NEW
    existingImages: [],
    removedImages: [],
    newImageFiles: [],
    newImagePreviews: [],
  });
  // ⭐ Reviews state 
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

    fetch(`http://localhost:3001/seller/${sellerId}/products`)
      .then((res) => res.json())
      .then((data) => {
        setMaterials(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
      availability: m.availability || "available", // ✅ FIX

      existingImages: (m.images || []).map(
        (img) => `http://localhost:3001/${img}`
      ),
      removedImages: [],
      newImageFiles: [],
      newImagePreviews: [],
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

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

    const previews = files.map((f) => URL.createObjectURL(f));

    setEditForm((p) => ({
      ...p,
      newImageFiles: [...p.newImageFiles, ...files],
      newImagePreviews: [...p.newImagePreviews, ...previews],
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

  const saveEdit = async () => {
    try {
      const formData = new FormData();

      formData.append("name", editForm.name);
      formData.append("category", editForm.category);
      formData.append("productType", editForm.productType);
      formData.append("price", editForm.price);
      formData.append("description", editForm.description);
      formData.append("availability", editForm.availability);


      // Keep only remaining images (strip server URL)
      const keptImages = editForm.existingImages.map((img) =>
        img.replace("http://localhost:3001/", "")
      );

      formData.append("existingImages", JSON.stringify(keptImages));

      // Add new images
      editForm.newImageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const res = await fetch(
        `http://localhost:3001/seller/product/${editingId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!res.ok) {
        alert("Failed to update product");
        return;
      }

      const data = await res.json();

      // ✅ Update UI instantly
      setMaterials((prev) =>
        prev.map((p) => (p.id === editingId ? data.product : p))
      );

      cancelEdit();
    } catch (err) {
      console.error(err);
      alert("Server error while updating product");
    }
  };

  /* =========================
     REMOVE PRODUCT (🔥 FIX)
  ========================= */
  const removeMaterial = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `http://localhost:3001/seller/product/${productId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        alert("Failed to delete product");
        return;
      }

      // ✅ Update UI instantly
      setMaterials((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error(err);
      alert("Server error while deleting product");
    }
  };

  const loadReviews = async (product) => {
    setSelectedProduct(product);

    try {
      const res = await fetch(
        `http://localhost:3001/product/${product.id}/ratings`
      );
      const data = await res.json();

      setRatingData({
        avgRating: data.avgRating || 0,
        count: data.count || 0,
        reviews: data.reviews || [],
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

        {editingId && (
          <section className="ms-edit-panel">
            <h2 className="ms-edit-title">Edit Product</h2>

            <div className="ms-edit-grid">
              <label className="ms-field">
                <span className="ms-label">Product Name</span>
                <input
                  name="name"
                  className="ms-input"
                  value={editForm.name}
                  onChange={handleChange}
                />
              </label>

              <label className="ms-field">
                <span className="ms-label">Product Type</span>
                <input
                  name="productType"
                  className="ms-input"
                  value={editForm.productType}
                  onChange={handleChange}
                />
              </label>

              <label className="ms-field">
                <span className="ms-label">Category</span>
                <input
                  name="category"
                  className="ms-input"
                  value={editForm.category}
                  onChange={handleChange}
                />
              </label>

              <label className="ms-field">
                <span className="ms-label">Price</span>
                <input
                  name="price"
                  className="ms-input"
                  value={editForm.price}
                  onChange={handleChange}
                />
              </label>

              <label className="ms-field">
                <span className="ms-label">Availability</span>
                <select
                  name="availability"
                  className="ms-input"
                  value={editForm.availability}
                  onChange={handleChange}
                >
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </label>


              <label className="ms-field ms-full">
                <span className="ms-label">Description</span>
                <textarea
                  name="description"
                  className="ms-textarea"
                  value={editForm.description}
                  onChange={handleChange}
                />
              </label>

              <label className="ms-field ms-full">
                <span className="ms-label">Product Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="ms-file"
                  onChange={handleImageSelect}
                />

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {editForm.existingImages.map((img, i) => (
                    <div key={i}>
                      <img src={img} className="ms-preview" alt="" />
                      <button className="ms-btn ms-btn--ghost" onClick={() => removeExistingImage(img)}>
                        Remove
                      </button>
                    </div>
                  ))}

                  {editForm.newImagePreviews.map((img, i) => (
                    <div key={i}>
                      <img src={img} className="ms-preview" alt="" />
                      <button onClick={() => removeNewImage(i)}>Remove</button>
                    </div>
                  ))}
                </div>
              </label>
            </div>

            <div className="ms-edit-actions">
              <button className="ms-btn ms-btn--ghost" onClick={cancelEdit}>
                Cancel
              </button>
              <button className="ms-btn ms-btn--primary" onClick={saveEdit}>
                Save Changes
              </button>
            </div>
          </section>
        )}

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

        <section className="ms-grid">
          {materials.length === 0 ? (
            <div className="ms-empty">No products added</div>
          ) : (
            materials.map((m) => (
              <article key={m.id} className="ms-card">
                <img
                  src={
                    m.images?.length
                      ? `http://localhost:3001/${m.images[slideIndex[m.id] || 0]
                      }`
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
                  <div className="ms-desc" title={m.description}>
                    {m.description}
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
