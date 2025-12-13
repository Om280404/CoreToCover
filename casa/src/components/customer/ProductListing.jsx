import React, { useState, useMemo } from "react";
import Navbar from "./Navbar";
import ProductCard from "./ProductCard"; // can rename later if needed
import Footer from "./Footer";
import "./ProductListing.css";
import { useLocation } from "react-router-dom";

/* =========================================
   MOCK PRODUCT DATA (Frontend Only)
========================================= */
const PRODUCTS = [
  {
    id: 1,
    supplierId: 101,
    title: "Premium Wooden Door",
    imageUrl: "/images/door.jpg",
    category: "Doors",
    price: 18500,
    description: "High-quality teak wood door with premium finish.",
    sellerName: "Om Interiors",
    sellerLocation: "Pune, Maharashtra",
  },
  {
    id: 2,
    sellerId: 102,
    title: "Modular Kitchen Cabinet",
    imageUrl: "/images/kitchen.jpg",
    category: "Kitchen",
    price: 45000,
    description: "Modern modular kitchen cabinet with soft-close drawers.",
    sellerName: "Casa Furnish",
    sellerLocation: "Mumbai, Maharashtra",
  },
  {
    id: 3,
    sellerId: 103,
    title: "Marble Flooring Tiles",
    imageUrl: "/images/tiles.jpg",
    category: "Flooring",
    price: 220,
    description: "Premium Italian marble tiles for luxury flooring.",
    sellerName: "Hearth Stones",
    sellerLocation: "Rajasthan, India",
  },
];

const ProductListing = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products] = useState(PRODUCTS);

  const location = useLocation();

  const currentPageTitle =
    location.state?.page || "Readymade Products";

  const currentPageDesc =
    location.state?.desc ||
    "Find the perfect product that enhances your quality of living.";

  /* =========================================
     CATEGORY LIST
  ========================================= */
  const categories = useMemo(() => {
    const uniqueCategories = products
      .map((p) => p.category)
      .filter(Boolean);
    return ["All", ...new Set(uniqueCategories)];
  }, [products]);

  /* =========================================
     FILTERED PRODUCTS
  ========================================= */
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter(
      (p) => p.category === selectedCategory
    );
  }, [products, selectedCategory]);

  return (
    <>
      <Navbar />

      <section className="products-section">
        <h2 className="products-title">{currentPageTitle}</h2>
        <p className="products-subtitle">{currentPageDesc}</p>

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

        {/* Product Grid */}
        <div className="product-grid">
          {filteredProducts.length === 0 ? (
            <div
              style={{
                padding: "20px",
                gridColumn: "1 / -1",
                color: "#6b7280",
              }}
            >
              No products available.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                sellerId={product.sellerId}
                title={product.title}
                image={product.imageUrl}
                category={product.category}
                price={product.price}
                description={product.description}
                seller={product.sellerName}
                origin={product.sellerLocation}
              />
            ))
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ProductListing;
