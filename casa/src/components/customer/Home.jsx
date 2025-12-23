import React, { useState, useEffect } from "react";
import "./Home.css";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaUser,
  FaGlobe,
  FaBars,
  FaTimes,
  FaUserGraduate,
} from "react-icons/fa";
import Raw from "../../assets/images/Raw1.png";
import Raw2 from "../../assets/images/Raw2.png";
import Raw3 from "../../assets/images/Raw3.png";
import Designer1 from "../../assets/images/Designer1.png";
import Designer2 from "../../assets/images/Designer2.png";
import Footer from "./Footer";

// SLIDESHOW CARD
const Card = ({ images, title, onClick }) => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % images.length);
        setFade(false);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="partition-card-vertical" onClick={onClick}>
      <div className="partition-img-box">
        <img
          src={images[index]}
          alt={title}
          className={`slideshow-img ${fade ? "fade-out" : "fade-in"}`}
        />
      </div>
      <h2 className="partition-title-under">{title}</h2>
    </div>
  );
};

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* NAVBAR STAYS AS IT IS */}
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Link to="/home" className="nav-link">
              <h1 className="logo">CASA</h1>
            </Link>
          </div>

          <div className="nav-right">
            <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
              <li><FaGlobe /> Language</li>

              <li>
                <Link to="/userprofile" className="nav-link">
                  <FaUser /> Profile
                </Link>
              </li>

              <li>
                <Link to="/myhireddesigners" className="nav-link">
                  <FaUserGraduate /> My Hired Designers
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

      {/* PAGE CONTENT */}
      <div className="partition-page fade-in">

        <div className="partition-grid">

          {/* Card 1 */}
          <Card
            title="Readymade Products"
            images={[
              "https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=800", // sofa interior
              "https://images.pexels.com/photos/3076899/pexels-photo-3076899.jpeg?auto=compress&cs=tinysrgb&w=800", // luxury lamp + modern interior
              "https://images.pexels.com/photos/1571461/pexels-photo-1571461.jpeg?auto=compress&cs=tinysrgb&w=800"  // modern wooden chair product
            ]}


            onClick={() => navigate("/productlisting", { state: { page: "Readymade Products", desc: "Find the perfect product that enhances your quality of living." } })}
          />

          {/* Card 2 */}
          <Card
            title="Raw Materials"
            images={[
              Raw, // raw materials image
              Raw2, // raw materials image 2
              Raw3  // raw materials image 3
            ]}
            onClick={() => navigate("/productlisting", { state: { page: "Raw Materials", desc: "Build better with high-grade interior raw materials." } })}
          />

          {/* Card 3 */}
          <Card
            title="Interior & Product Designers"
            images={[
              Designer1, // designer sketching furniture
              Designer2,  // designer meeting with clients
              "https://images.pexels.com/photos/6474344/pexels-photo-6474344.jpeg?auto=compress&cs=tinysrgb&w=800", // interior designer working
            ]}

            onClick={() => navigate("/designers", { state: { page: "Designers" } })}
          />

        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
