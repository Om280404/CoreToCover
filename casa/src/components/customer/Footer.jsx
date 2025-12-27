import React from 'react'
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-brand">
          <h2 className="footer-logo">CASA</h2>
          <p className="footer-tagline">Reliable materials, delivered fast.</p>
        </div>

        {/* Links */}
        <ul className="footer-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          {/* <li><a href="#">Products</a></li>
          <li><a href="#">Suppliers</a></li> */}
          <li><a href="/contact">Contact</a></li>
        </ul>

        {/* Social Icons */}
        <div className="footer-social">
          <a href="#"><FaFacebookF /></a>
          <a href="#"><FaInstagram /></a>
          <a href="#"><FaTwitter /></a>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} CASA. All rights reserved.
      </div>
    </footer>
  );
}
