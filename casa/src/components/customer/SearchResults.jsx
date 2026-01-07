// src/components/SearchResults/SearchResults.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import ProductCard from "./ProductCard";
import Footer from "./Footer";
import "./SearchResults.css";
import api from "../../api/axios";

const entityTypeFromCategory = (category) => {
  if (!category) return "product";
  const c = category.toLowerCase();
  if (c.includes("designer")) return "designer";
  if (c.includes("raw")) return "raw_material";
  return "product";
};

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("search") || "";
  const category = queryParams.get("category") || ""; // explicit category slug from URL

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // decide strictly from category param; do not override if category is present
  const entityType = entityTypeFromCategory(category);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const isDesigner = entityType === "designer";
    const endpoint = isDesigner ? "/designers/search" : "/products/search";
    const params = { q: searchQuery };

    // pass type only for products (so backend can filter readymade/raw)
    if (!isDesigner && category) {
      params.type = category;
    }

    api
      .get(endpoint, { params })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];

        if (isDesigner) {
          // designers endpoint returns a different shape; normalize to ProductCard props expected
          setResults(
            data.map((d) => ({
              id: d.id,
              title: d.name || d.fullname || "Designer",
              category: d.category || "Designer",
              description: d.description || "",
              images: d.images || [],
              seller: null,
              origin: d.location || "Not specified",
              availability: d.availability ?? "Unavailable",
              avgRating: d.average ?? 0,
              ratingCount: d.count ?? 0,
            }))
          );
        } else {
          // products endpoint already formatted (see backend)
          setResults(data);
        }
      })
      .catch((err) => {
        console.error("Search error:", err);
        setError(err);
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [searchQuery, category]); // re-run when URL search or category changes

  const categoryDisplay = category ? category.replace(/-/g, " ") : "";
  const effectiveCategoryDisplay = entityType === "designer" ? "designers" : categoryDisplay;

  return (
    <>
      <Navbar />

      <div className="results">
        <h2>Search Results</h2>
        <p>
          Showing results for: <strong>{searchQuery}</strong>
          {effectiveCategoryDisplay && (
            <span style={{ color: "#6b7280" }}>
              {" "}
              (category: <strong>{effectiveCategoryDisplay}</strong>)
            </span>
          )}
        </p>

        <div className="product-grid">
          {loading && <p style={{ gridColumn: "1 / -1" }}>Searching…</p>}

          {!loading && !searchQuery.trim() && (
            <p style={{ gridColumn: "1 / -1", color: "#6b7280" }}>Please enter a search term.</p>
          )}

          {!loading && searchQuery.trim() !== "" && results.length === 0 && !error && (
            <p style={{ gridColumn: "1 / -1", color: "#6b7280" }}>
              No {entityType === "designer" ? "designers" : "product"} found matching your search.
            </p>
          )}

          {error && (
            <p style={{ gridColumn: "1 / -1", color: "crimson" }}>
              Something went wrong while searching. Check console/network.
            </p>
          )}

          {!loading &&
            results.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                sellerId={item.sellerId}
                title={item.title || item.name}
                category={item.category}
                price={item.price}
                description={item.description}
                images={item.images}
                seller={item.seller}
                origin={item.origin}
                availability={item.availability}
                avgRating={item.avgRating}
                ratingCount={item.ratingCount}
                entityType={entityType}
              />
            ))}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default SearchResults;
