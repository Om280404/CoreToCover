import React, { useState, useMemo } from "react";
import Navbar from "./Navbar";
import DesignerCard from "./DesignerCard";
import Footer from "./Footer";
import "./ProductListing.css";

/* =========================================
   MOCK DESIGNERS DATA (Frontend Only)
========================================= */
const DESIGNERS = [
  {
    id: 1,
    designerId: 201,
    name: "Modern Interior Designer",
    imageUrl: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg",
    category: "Interior",
    description: "Specialist in modern home interiors and space optimization.",
    designerLocation: "Pune, Maharashtra",
  },
  {
    id: 2,
    designerId: 202,
    name: "Luxury Home Designer",
    imageUrl: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg",
    category: "Luxury",
    description: "High-end luxury interior designer for premium homes.",
    designerLocation: "Mumbai, Maharashtra",
  },
  {
    id: 3,
    designerId: 203,
    title: "Commercial Space Designer",
    imageUrl: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg",
    category: "Commercial",
    description: "Designing efficient and aesthetic commercial spaces.",
    designerLocation: "Bengaluru, India",
  },
];

const Designers = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [designers] = useState(DESIGNERS);

  /* =========================================
     CATEGORY LIST
  ========================================= */
  const categories = useMemo(() => {
    const uniqueCategories = designers
      .map((d) => d.category)
      .filter(Boolean);
    return ["All", ...new Set(uniqueCategories)];
  }, [designers]);

  /* =========================================
     FILTERED DESIGNERS
  ========================================= */
  const filteredDesigners = useMemo(() => {
    if (selectedCategory === "All") return designers;
    return designers.filter(
      (d) => d.category === selectedCategory
    );
  }, [designers, selectedCategory]);

  return (
    <>
      <Navbar />

      <section className="products-section">
        <h2 className="products-title">Designers</h2>
        <p className="products-subtitle">
          Customize your living space with the help of our expert interior and
          product designers.
        </p>

        {/* Category Filter */}
        <div className="category-filter">
          {categories.map((cat) => (
            <button
              key={cat}
              className={cat === selectedCategory ? "active" : ""}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Designers Grid */}
        <div className="product-grid">
          {filteredDesigners.length === 0 ? (
            <div
              style={{
                padding: "20px",
                gridColumn: "1 / -1",
                color: "#6b7280",
              }}
            >
              No designers found in this category.
            </div>
          ) : (
            filteredDesigners.map((designer) => (
              <DesignerCard
                key={designer.id}
                id={designer.id}
                supplierId={designer.designerId}
                name={designer.name}
                image={designer.imageUrl}
                category={designer.category}
                description={designer.description}
                supplier={designer.supplierName}
                origin={designer.supplierLocation}
              />
            ))
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Designers;
