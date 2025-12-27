import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaGlobe,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useLocation } from "react-router-dom";


const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const location = useLocation();
  
  const currentPageTitle = location.state?.page || "Readymade Products";

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query !== "") {
      navigate(`/searchresults?search=${encodeURIComponent(query)}`);
      setSearchQuery("");
      setMenuOpen(false);
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Link to="/" className="nav-link">
              <h1 className="logo">CASA</h1>
            </Link>
          </div>

          {/* Center: Search (Desktop) */}
          <div className="nav-center">
            <form onSubmit={handleSearch} className="search-bar">
              <input
                type="text"
                placeholder={`Search ${currentPageTitle}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="search-btn"
                disabled={searchQuery.trim() === ""}
                title={
                  searchQuery.trim() === ""
                    ? "Enter something to search"
                    : "Search"
                }
              >
                <FaSearch className="search-icon" />
              </button>
            </form>
          </div>

          {/* Right: Links + Hamburger (Mobile) */}
          <div className="nav-right">
            <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
              <li>
                <FaGlobe /> Language
              </li>
              <li>
                <Link to="/userprofile" className="nav-link">
                  <FaUser /> Profile
                </Link>
              </li>
              <li>
                <Link to="/cart" className="cart-btn">
                  <FaShoppingCart /> Cart
                </Link>
              </li>
              <li>
                <Link to="/sellersignup" className="seller-btn">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link to="/designersignup" className="seller-btn">
                  I am a Designer
                </Link>
              </li>
            </ul>

            <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes /> : <FaBars />}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="search-btn"
            disabled={searchQuery.trim() === ""}
            title={
              searchQuery.trim() === ""
                ? "Enter something to search"
                : "Search"
            }
          >
            <FaSearch />
          </button>
        </form>
      </div>
    </>
  );
};

export default Navbar;