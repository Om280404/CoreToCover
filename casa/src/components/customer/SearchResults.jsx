import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import ProductCard from "./ProductCard";
import Footer from "./Footer";
import "./SearchResults.css";

/* =========================================
   MOCK PRODUCTS (Frontend Only)
========================================= */
const PRODUCTS = [
  {
    id: 1,
    title: "Premium Wooden Door",
    imageUrl: "/images/door.jpg",
    category: "Doors",
    price: 18500,
    description: "High-quality teak wood door with premium finish.",
    supplierName: "Om Interiors",
    supplierLocation: "Pune, Maharashtra",
  },
  {
    id: 2,
    title: "Modular Kitchen Cabinet",
    imageUrl: "/images/kitchen.jpg",
    category: "Kitchen",
    price: 45000,
    description: "Modern modular kitchen cabinet with soft-close drawers.",
    supplierName: "Casa Furnish",
    supplierLocation: "Mumbai, Maharashtra",
  },
  {
    id: 3,
    title: "Marble Flooring Tiles",
    imageUrl: "/images/tiles.jpg",
    category: "Flooring",
    price: 220,
    description: "Premium Italian marble tiles for luxury flooring.",
    supplierName: "Hearth Stones",
    supplierLocation: "Rajasthan, India",
  },
];

const SearchResults = () => {
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("search") || "";

  /* =========================================
     FRONTEND SEARCH FILTER
  ========================================= */
  const results = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const q = searchQuery.toLowerCase();

    return PRODUCTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <>
      <Navbar />

      <div className="results">
        <h2>Search Results</h2>
        <p>
          Showing results for: <strong>{searchQuery}</strong>
        </p>

        <div className="product-grid">
          {searchQuery.trim() === "" && (
            <p style={{ gridColumn: "1 / -1", color: "#6b7280" }}>
              Please enter a search term.
            </p>
          )}

          {searchQuery.trim() !== "" && results.length === 0 && (
            <p style={{ gridColumn: "1 / -1", color: "#6b7280" }}>
              No product found matching your search term.
            </p>
          )}

          {results.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              image={product.imageUrl}
              category={product.category}
              price={product.price}
              description={product.description}
              seller={product.supplierName}
              origin={product.supplierLocation}
            />
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default SearchResults;
