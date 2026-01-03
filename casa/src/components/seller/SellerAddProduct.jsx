// File: src/components/supplier/SelledAddProduct.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationButton from "./NotificationButton";
import "./SellerAddProduct.css";

const SellerAddProduct = () => {
    const navigate = useNavigate();

    /* ===============================
       FORM STATE
    =============================== */
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [productType, setProductType] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");

    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const [video, setVideo] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);

    const [submitting, setSubmitting] = useState(false);

    /* ===============================
       PRODUCT TYPE & CATEGORY
    =============================== */
    const productCategories = {
        finished: [
            "Furniture",
            "Modular Kitchen",
            "Doors & Windows",
            "Wardrobes",
            "Lighting",
            "Wall Panels",
            "Decor Items",
        ],
        material: [
            "Plywood & Boards",
            "MDF / HDF",
            "Laminates & Veneers",
            "Hardware & Fittings",
            "Glass & Mirrors",
            "Marble & Stone",
            "Fabrics & Upholstery",
            "Paints & Finishes",
        ],
    };

    /* ===============================
       IMAGE HANDLING (1–5 IMAGES)
    =============================== */
    const handleImages = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        const totalCount = images.length + selectedFiles.length;
        if (totalCount > 5) {
            alert("You can upload a maximum of 5 images.");
            return;
        }

        for (let file of selectedFiles) {
            if (!file.type.startsWith("image/")) {
                alert("Only image files are allowed.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert("Each image must be under 5MB.");
                return;
            }
        }

        setImages((prev) => [...prev, ...selectedFiles]);
        setImagePreviews((prev) => [
            ...prev,
            ...selectedFiles.map((f) => URL.createObjectURL(f)),
        ]);

        e.target.value = "";
    };

    /* ===============================
       VIDEO HANDLING
    =============================== */
    const handleVideo = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("video/")) {
            alert("Only video files allowed.");
            return;
        }

        if (file.size > 30 * 1024 * 1024) {
            alert("Video must be under 30MB.");
            return;
        }

        setVideo(file);
        setVideoPreview(URL.createObjectURL(file));
    };

    /* ===============================
       SUBMIT → BACKEND
    =============================== */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) return alert("Product name is required.");
        if (!productType) return alert("Select product type.");
        if (!category) return alert("Select category.");
        if (price === "" || Number(price) < 0)
            return alert("Enter a valid price.");
        if (images.length < 1 || images.length > 5)
            return alert("Upload 1–5 images.");

        const sellerId = localStorage.getItem("SellerId");
        if (!sellerId) return alert("Seller not logged in.");

        setSubmitting(true);

        try {
            const formData = new FormData();

            formData.append("sellerId", sellerId);
            formData.append("name", name);
            formData.append("price", price);
            formData.append("productType", productType);
            formData.append("category", category);
            formData.append("description", description);

            images.forEach((img) => formData.append("images", img));
            if (video) formData.append("video", video);

            const res = await fetch("http://localhost:3001/seller/product", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to add product");
                return;
            }

            alert("Product added successfully ✅");

            setImages([]);
            setImagePreviews([]);
            setVideo(null);
            setVideoPreview(null);

            navigate("/selleraddproduct");
        } catch (err) {
            console.error("ADD PRODUCT ERROR:", err);
            alert("Server error while adding product");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="sma-root">
            <Sidebar />
            <NotificationButton />

            <main className="sma-main">
                <form
                    className="sma-card"
                    onSubmit={handleSubmit}
                    encType="multipart/form-data"
                >
                    <h2 className="sma-title">➕ Add New Product</h2>

                    <div className="sma-grid">
                        <label className="sma-field">
                            <span className="sma-label">Product Name *</span>
                            <input
                                className="sma-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Premium Wooden Door"
                            />
                        </label>

                        <label className="sma-field">
                            <span className="sma-label">Price *</span>
                            <input
                                type="number"
                                min="0"
                                className="sma-input"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="₹15000"
                            />
                        </label>

                        <label className="sma-field">
                            <span className="sma-label">Product Type *</span>
                            <select
                                className="sma-input"
                                value={productType}
                                onChange={(e) => {
                                    setProductType(e.target.value);
                                    setCategory("");
                                }}
                            >
                                <option value="">Select</option>
                                <option value="finished">Finished Interior Product</option>
                                <option value="material">Interior Material</option>
                            </select>
                        </label>

                        <label className="sma-field">
                            <span className="sma-label">Category *</span>
                            <select
                                className="sma-input"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={!productType}
                            >
                                <option value="">Select</option>
                                {productType &&
                                    productCategories[productType].map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                            </select>
                        </label>

                        <label className="sma-field sma-full">
                            <span className="sma-label">Description</span>
                            <textarea
                                className="sma-textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </label>

                        <label className="sma-field sma-full">
                            <span className="sma-label">
                                Upload Images (1–5 allowed)
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImages}
                                className="sma-file"
                            />

                            {imagePreviews.length > 0 && (
                                <div className="sma-preview-grid">
                                    {imagePreviews.map((src, i) => (
                                        <img key={i} src={src} className="sma-preview" />
                                    ))}
                                </div>
                            )}
                        </label>

                        <label className="sma-field sma-full">
                            <span className="sma-label">Upload Video (optional)</span>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleVideo}
                                className="sma-file"
                            />

                            {videoPreview && (
                                <video
                                    src={videoPreview}
                                    controls
                                    className="sma-preview"
                                />
                            )}
                        </label>
                    </div>

                    <div className="sma-actions">
                        <button
                            type="submit"
                            className="sma-btn sma-btn--primary"
                            disabled={submitting}
                        >
                            {submitting ? "Adding..." : "Add Product"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default SellerAddProduct;
