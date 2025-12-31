import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./About.css";

import CoreToCoverLogo from "../../assets/logo/CoreToCover_2.png";
import CoreToCoverTitle from "../../assets/logo/CoreToCover_1.png";

export default function About() {
  const Brand = ({ children }) => <span className="brand">{children}</span>;

  /* =========================
     VIEWPORT DETECTION
  ========================= */
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 900px)");

    const handleChange = (e) => setIsMobileOrTablet(e.matches);

    setIsMobileOrTablet(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <section className="about-page">
      {/* =========================
          HERO
      ========================= */}
      <header className="about-hero">
        <div className="about-hero-inner">
          <div className="hero-copy">
            {/* ---------- TITLE ---------- */}
            {isMobileOrTablet ? (
              /* MOBILE / TABLET: logo LEFT, text RIGHT (inline) */
              <p className="mobile-brand-text">
                <img
                  src={CoreToCoverTitle}
                  alt="CoreToCover"
                  className="inline-brand-logo"
                />
                A unified platform where customers can discover curated interior products,
                source high-quality raw materials, and collaborate with skilled freelance
                interior designers — all in one place.
              </p>

            ) : (
              /* DESKTOP: keep original H1 + paragraph */
              <>
                <h1 className="hero-title">
                  <Brand>CoreToCover</Brand> — a premium marketplace for home interiors & materials
                </h1>

                <p className="hero-sub">
                  <Brand>CoreToCover</Brand> is a unified platform where customers can discover
                  curated interior products, source high-quality raw materials, and
                  directly collaborate with skilled freelance interior designers —
                  all in one place.
                </p>
              </>
            )}


            {/* ---------- CTAs ---------- */}
            <div className="hero-ctas">
              <Link to="/" className="btn btn-primary">
                Explore Marketplace
              </Link>
              <Link
                to="/signup"
                className="btn btn-ghost"
                aria-label="Create an account"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>

        {/* ---------- DESKTOP HERO LOGO ONLY ---------- */}
        {!isMobileOrTablet && (
          <div className="hero-art" aria-hidden>
            <img src={CoreToCoverLogo} alt="CoreToCover logo" />
          </div>
        )}
      </header>

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <main className="about-main">
        {/* =========================
            VISION
        ========================= */}
        <section className="about-story card">
          <div className="card-left">
            <h2>Our vision</h2>

            <p>
              <Brand>CoreToCover</Brand> was built to simplify how people plan,
              purchase, and execute home interior projects. Instead of navigating
              fragmented offline markets, customers get access to finished
              interior products and essential raw materials — seamlessly, on one
              platform.
            </p>

            <p>
              Beyond commerce, <Brand>CoreToCover</Brand> enables direct
              collaboration between customers and verified freelance interior
              designers, supporting transparent communication, customization,
              and professional project execution.
            </p>
          </div>

          <aside className="card-right stats" aria-hidden>
            <div className="stat">
              <div className="stat-num">Curated</div>
              <div className="stat-label">Interior Products</div>
            </div>
            <div className="stat">
              <div className="stat-num">Raw</div>
              <div className="stat-label">Materials Marketplace</div>
            </div>
            <div className="stat">
              <div className="stat-num">Freelance</div>
              <div className="stat-label">Designer Hub</div>
            </div>
          </aside>
        </section>

        {/* =========================
            LEADERSHIP
        ========================= */}
        <section className="about-founders card">
          <div className="founders-hero">
            <h2>Leadership</h2>
            <p className="muted">
              A focused team building a modular, trust-driven ecosystem for the
              future of home interiors.
            </p>
          </div>

          <div className="founders-grid">
            <div className="founder-feature">
              <div className="founder-info">
                <div className="founder-name">Om Karande</div>
                <div className="founder-role">Founder & Product Lead</div>
                <div className="founder-bio">
                  Om leads the vision, product strategy, and frontend experience,
                  shaping <Brand>CoreToCover</Brand> as a modern, design-forward
                  platform for interiors and materials.
                </div>
              </div>
            </div>

            <div className="cofounders">
              <h3 className="cofounders-title">Co-founders</h3>

              <div className="founder-list">
                <div className="founder">
                  <div className="founder-info">
                    <div className="founder-name">Atharv Khot</div>
                    <div className="founder-role">Backend Engineer</div>
                    <div className="founder-bio">
                      Atharv designs scalable backend systems and APIs powering
                      <Brand>CoreToCover</Brand>’s marketplace.
                    </div>
                  </div>
                </div>

                <div className="founder">
                  <div className="founder-info">
                    <div className="founder-name">Soham Phatak</div>
                    <div className="founder-role">Backend Engineer</div>
                    <div className="founder-bio">
                      Soham focuses on performance, authentication, and
                      reliability to ensure secure platform operations.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            VALUES
        ========================= */}
        <section className="about-values card">
          <h2>What we stand for</h2>
          <ul className="values-list">
            <li><strong>Curated quality:</strong> Premium products and materials selected for long-term value.</li>
            <li><strong>Seller & designer empowerment:</strong> Fair tools and clear economics.</li>
            <li><strong>Customer confidence:</strong> Transparent pricing and trusted professionals.</li>
            <li><strong>Modular ecosystem:</strong> Products, materials, and services that work together.</li>
            <li><strong>Trust by design:</strong> UX decisions that reduce friction.</li>
          </ul>
        </section>

        {/* =========================
            CTA
        ========================= */}
        <section className="about-cta-section card">
          <h2 className="cta-title">
            Build your space with <Brand>CoreToCover</Brand>
          </h2>

          <p className="cta-description">
            Explore interior products, source raw materials, or collaborate with
            trusted designers — all from one premium platform.
          </p>

          <div className="cta-actions">
            <Link to="/signup" className="cta-button">
              Get started
            </Link>
          </div>

          <div className="cta-credits">
            <p className="credits-title">Credits</p>
            <p>Founder & Frontend — Om Karande</p>
            <p>Backend Engineers — Atharv Khot, Soham Phatak</p>
          </div>
        </section>
      </main>
    </section>
  );
}
