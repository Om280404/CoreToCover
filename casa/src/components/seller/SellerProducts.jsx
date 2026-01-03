import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import NotificationButton from "./NotificationButton";
import "./SellerProducts.css";

/*
  SellerProducts.jsx (Frontend Only)
  - No backend / no API
  - Uses localStorage
  - Mock data based on Add New Product form
  - Keeps ms- class names unchanged
*/

const STORAGE_KEY = "materials";

/* MOCK PRODUCTS (Sofas & Fancy Chairs) */
const DEMO_MATERIALS = [
  {
    id: 1,
    name: "Luxury Velvet Sofa",
    category: "Sofa",
    productType: "Finished Product",
    price: "45000",
    quantity: 8,
    description:
      "Premium velvet sofa with solid wooden frame. Designed for modern living rooms with superior comfort.",
    image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed",
  },
  {
    id: 2,
    name: "Royal Accent Chair",
    category: "Chair",
    productType: "Finished Product",
    price: "18500",
    quantity: 3,
    description:
      "Elegant accent chair with cushioned seating and premium fabric. Ideal for bedrooms and lounges.",
    image: "https://images.pexels.com/photos/3965520/pexels-photo-3965520.jpeg"
  },
  {
    id: 3,
    name: "Modern Leather Sofa Set",
    category: "Sofa",
    productType: "Finished Product",
    price: "72000",
    quantity: 0,
    description:
      "Contemporary leather sofa set with high-density foam and durable upholstery.",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
  },
];

const getStockStatus = (qty) => {
  if (qty === 0) return "Out of Stock";
  if (qty <= 5) return "Low Stock";
  return "Available";
};

const SellerProducts = () => {
  const [materials, setMaterials] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    productType: "",
    price: "",
    unit: "",
    quantity: "",
    description: "",
    imageFile: null,
    imagePreview: "",
  });

  /* Load from localStorage */
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      setMaterials(Array.isArray(stored) && stored.length ? stored : DEMO_MATERIALS);
    } catch {
      setMaterials(DEMO_MATERIALS);
    }
    setLoading(false);
  }, []);

  /* Persist to localStorage */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
  }, [materials]);

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditForm({
      name: m.name,
      category: m.category,
      productType: m.productType,
      price: m.price,
      unit: m.unit,
      quantity: m.quantity,
      description: m.description,
      imageFile: null,
      imagePreview: m.image,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: "",
      category: "",
      productType: "",
      price: "",
      unit: "",
      quantity: "",
      description: "",
      imageFile: null,
      imagePreview: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setEditForm((p) => ({ ...p, imageFile: file, imagePreview: preview }));
  };

  const saveEdit = () => {
    if (!editForm.name || !editForm.price) {
      alert("Product name and price are required");
      return;
    }

    setMaterials((prev) =>
      prev.map((m) =>
        m.id === editingId
          ? {
              ...m,
              ...editForm,
              quantity: Number(editForm.quantity),
              image: editForm.imagePreview || m.image,
            }
          : m
      )
    );

    cancelEdit();
  };

  const removeMaterial = (id) => {
    if (!window.confirm("Remove this product?")) return;
    setMaterials((prev) => prev.filter((m) => m.id !== id));
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
                <input name="name" className="ms-input" value={editForm.name} onChange={handleChange} />
              </label>

              <label className="ms-field">
                <span className="ms-label">Product Type</span>
                <input name="productType" className="ms-input" value={editForm.productType} onChange={handleChange} />
              </label>

              <label className="ms-field">
                <span className="ms-label">Category</span>
                <input name="category" className="ms-input" value={editForm.category} onChange={handleChange} />
              </label>

              <label className="ms-field">
                <span className="ms-label">Price</span>
                <input name="price" className="ms-input" value={editForm.price} onChange={handleChange} />
              </label>

              <label className="ms-field">
                <span className="ms-label">Unit</span>
                <select name="unit" className="ms-input" value={editForm.unit} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Piece">Piece</option>
                  <option value="Set">Set</option>
                </select>
              </label>

              <label className="ms-field">
                <span className="ms-label">Quantity</span>
                <input
                  type="number"
                  name="quantity"
                  className="ms-input"
                  value={editForm.quantity}
                  onChange={handleChange}
                />
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
                <span className="ms-label">Product Image</span>
                <input type="file" accept="image/*" className="ms-file" onChange={handleImageSelect} />
                {editForm.imagePreview && (
                  <img src={editForm.imagePreview} className="ms-preview" alt="preview" />
                )}
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

        <section className="ms-grid">
          {materials.length === 0 ? (
            <div className="ms-empty">No products added</div>
          ) : (
            materials.map((m) => (
              <article key={m.id} className="ms-card">
                <img src={m.image} alt={m.name} className="ms-thumb" />

                <div className="ms-body">
                  <h3 className="ms-name">Product Name: {m.name}</h3>
                  <div className="ms-price">
                    Price: ₹{m.price} 
                  </div>
                  <div className="ms-desc">Description: {m.description}</div>
                  <div className="ms-meta">
                    Status: <strong>{getStockStatus(m.quantity)}</strong>
                  </div>
                </div>

                <div className="ms-actions">
                  <button className="ms-btn ms-btn--outline" onClick={() => startEdit(m)}>
                    Edit
                  </button>
                  <button className="ms-btn ms-btn--ghost" onClick={() => removeMaterial(m.id)}>
                    Remove
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
