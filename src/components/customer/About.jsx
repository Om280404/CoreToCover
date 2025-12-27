// File: src/pages/About.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

export default function About() {
  return (
    <section className="about-page">
      <header className="about-hero">
        <div className="about-hero-inner">
          <div className="hero-copy">
            <h1 className="hero-title">
              Casa — premium marketplace for home interiors & materials
            </h1>
            <p className="hero-sub">
              Casa is an e-commerce platform for curated home interior products,
              raw materials used to craft interiors, and a freelancing hub where
              customers can hire skilled interior designers directly.
            </p>

            <div className="hero-ctas">
              <Link to="/home" className="btn btn-primary" aria-label="Explore Marketplace">
                Explore Marketplace
              </Link>
              <Link to="/signup" className="btn btn-ghost" aria-label="Create an account">
                Create an account
              </Link>
            </div>
          </div>
        </div>

        <figure className="hero-art" aria-hidden>
          <svg viewBox="0 0 800 400" className="art-svg" role="img" aria-hidden>
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0" stopColor="#dffaf0" />
                <stop offset="1" stopColor="#e8fff6" />
              </linearGradient>
              <linearGradient id="g2" x1="0" x2="1">
                <stop offset="0" stopColor="#a7f3d0" />
                <stop offset="1" stopColor="#34d399" />
              </linearGradient>
            </defs>

            <rect width="800" height="400" fill="url(#g1)" />
            <g transform="translate(40,40)">
              <ellipse cx="560" cy="260" rx="240" ry="100" fill="url(#g2)" opacity="0.22" />
              <rect x="40" y="40" width="420" height="180" rx="18" fill="#fff" opacity="0.9" stroke="#e6f6ee" />
            </g>
          </svg>
        </figure>
      </header>

      <main className="about-main">
        <section className="about-story card">
          <div className="card-left">
            <h2>Our vision</h2>
            <p>
              Casa was built to simplify how people discover, purchase, and
              execute home interior projects. From finished interior products to
              raw materials like wood, stone, fittings, and hardware — everything
              lives in one seamless marketplace.
            </p>
            <p>
              Beyond products, Casa connects customers directly with verified
              freelance interior designers, enabling transparent collaboration,
              customization, and execution.
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

        <section className="about-founders card">
          <div className="founders-hero">
            <h2>Leadership</h2>
            <p className="muted">
              A focused team building a premium, modular ecosystem that empowers
              sellers and delights customers.
            </p>
          </div>

          <div className="founders-grid">
            <div className="founder-feature" role="group" aria-labelledby="founder-om">
              <div className="founder-info">
                <div id="founder-om" className="founder-name">Om Karande</div>
                <div className="founder-role">Founder & Product Lead</div>
                <div className="founder-bio">
                  Om leads the vision, product design, and frontend experience,
                  shaping Casa as a modern e-commerce platform for interiors.
                </div>
              </div>
            </div>

            <div className="cofounders" aria-label="Co-founders">
              <h3 className="cofounders-title">Co-founders</h3>

              <div className="founder-list">
                <div className="founder" role="group" aria-labelledby="cofounder-atharv">
                  <div className="founder-info">
                    <div id="cofounder-atharv" className="founder-name">Atharv Khot</div>
                    <div className="founder-role">Backend Engineer</div>
                    <div className="founder-bio">
                      Atharv builds scalable backend systems, APIs, and data
                      architecture powering Casa’s marketplace and services.
                    </div>
                  </div>
                </div>

                <div className="founder" role="group" aria-labelledby="cofounder-soham">
                  <div className="founder-info">
                    <div id="cofounder-soham" className="founder-name">Soham Phatak</div>
                    <div className="founder-role">Backend Engineer</div>
                    <div className="founder-bio">
                      Soham focuses on performance, authentication, and
                      integrations to ensure reliable transactions and workflows.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-values card">
          <h2>What we stand for</h2>
          <ul className="values-list">
            <li><strong>Curated quality:</strong> Carefully selected products and materials for premium interiors.</li>
            <li><strong>Seller empowerment:</strong> Tools that help sellers and designers grow sustainably.</li>
            <li><strong>Customer delight:</strong> Clear pricing, rich choice, and smooth buying experiences.</li>
            <li><strong>Modular ecosystem:</strong> Products, materials, and services working together.</li>
            <li><strong>Trust & design:</strong> Thoughtful UX that builds confidence at every step.</li>
          </ul>
        </section>

        <section className="about-cta card">
          <h2>Build your space with Casa</h2>
          <p>
            Explore interior products, source raw materials, or hire skilled
            designers — all from one premium platform.
          </p>
          <div className="cta-row">
            <Link to="/signup" className="btn btn-primary large" aria-label="Create account">
              Get started
            </Link>
          </div>

          <div className="credits">
            <p><strong>Credits</strong></p>
            <p>Founder & Frontend — Om Karande</p>
            <p>Backend Engineers — Atharv Khot, Soham Phatak</p>
          </div>
        </section>
      </main>
    </section>
  );
}
