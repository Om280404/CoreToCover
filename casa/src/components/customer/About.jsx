// File: src/pages/About.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./About.css";
import CCInline from "./CCInline";

export default function About() {
  return (
    <section className="about-page">
      <header className="about-hero">
        <div className="about-hero-inner">
          <div className="hero-copy">
            <h1 className="hero-title">
              <CCInline /> — a premium marketplace for home interiors & materials
            </h1>

            <p className="hero-sub">
              <CCInline /> is a unified platform where customers can discover
              curated interior products, source high-quality raw materials, and
              directly collaborate with skilled freelance interior designers —
              all in one place.
            </p>

            <div className="hero-ctas">
              <Link to="/" className="btn btn-primary" aria-label="Explore Marketplace">
                Explore Marketplace
              </Link>
              <Link to="/signup" className="btn btn-ghost" aria-label="Create an account">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="about-main">
        {/* =========================
            Vision / Story
        ========================= */}
        <section className="about-story card">
          <div className="card-left">
            <h2>Our vision</h2>

            <p>
              <CCInline /> was built to simplify how people plan, purchase, and
              execute home interior projects. Instead of navigating fragmented
              offline markets, customers get access to finished interior products
              and essential raw materials — seamlessly, on one platform.
            </p>

            <p>
              Beyond commerce, <CCInline /> enables direct collaboration between
              customers and verified freelance interior designers, supporting
              transparent communication, customization, and professional project
              execution.
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
            Leadership
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
            <div className="founder-feature" role="group" aria-labelledby="founder-om">
              <div className="founder-info">
                <div id="founder-om" className="founder-name">Om Karande</div>
                <div className="founder-role">Founder & Product Lead</div>
                <div className="founder-bio">
                  Om leads the vision, product strategy, and frontend experience,
                  shaping <CCInline /> as a modern, design-forward platform for
                  interiors and materials.
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
                      Atharv designs and maintains scalable backend systems,
                      APIs, and data models that power <CCInline />’s marketplace
                      and designer workflows.
                    </div>
                  </div>
                </div>

                <div className="founder" role="group" aria-labelledby="cofounder-soham">
                  <div className="founder-info">
                    <div id="cofounder-soham" className="founder-name">Soham Phatak</div>
                    <div className="founder-role">Backend Engineer</div>
                    <div className="founder-bio">
                      Soham focuses on performance, authentication, integrations,
                      and reliability to ensure smooth transactions and secure
                      platform operations.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            Values
        ========================= */}
        <section className="about-values card">
          <h2>What we stand for</h2>
          <ul className="values-list">
            <li><strong>Curated quality:</strong> Premium products and materials selected for long-term interior value.</li>
            <li><strong>Seller & designer empowerment:</strong> Fair tools, clear economics, and growth-oriented features.</li>
            <li><strong>Customer confidence:</strong> Transparent pricing, trusted professionals, and reliable workflows.</li>
            <li><strong>Modular ecosystem:</strong> Products, materials, and services designed to work together.</li>
            <li><strong>Trust by design:</strong> UX decisions that reduce friction and build confidence.</li>
          </ul>
        </section>

        {/* =========================
            Platform Features
        ========================= */}
        <section className="about-features card">
          <h2>Key platform features</h2>
          <p className="muted">
            Features designed to create trust, fairness, and clarity for both
            designers and clients.
          </p>

          <div className="features-grid" role="list">
            <article className="feature" role="listitem" aria-labelledby="feat-ratings">
              <h3 id="feat-ratings">Mutual ratings & reviews</h3>
              <p>
                On <CCInline />, both customers and designers can leave verified
                ratings and reviews for one another — creating a two-way feedback
                system that raises standards across the platform.
              </p>

              <ul className="feature-benefits">
                <li><strong>For designers:</strong> Understand client professionalism, communication style, and reliability before accepting work.</li>
                <li><strong>For clients:</strong> Choose designers based on verified performance and past project outcomes.</li>
                <li><strong>For the platform:</strong> Improves matching quality and encourages professional behaviour.</li>
              </ul>
            </article>

            <article className="feature" role="listitem" aria-labelledby="feat-subscription">
              <h3 id="feat-subscription">Subscription-based designer memberships</h3>
              <p>
                <CCInline /> does not charge per-project commissions from designers.
                Instead, designers subscribe to monthly plans that unlock platform
                access and growth tools.
              </p>

              <ul className="feature-benefits">
                <li><strong>Predictable costs:</strong> Simple monthly pricing with no hidden deductions.</li>
                <li><strong>Higher earnings:</strong> Designers keep their full project fees.</li>
                <li><strong>Premium perks:</strong> Priority visibility, verified badges, insights, and lead access.</li>
                <li><strong>Platform sustainability:</strong> Recurring revenue supports long-term product investment.</li>
              </ul>
            </article>

            <article className="feature" role="listitem" aria-labelledby="feat-agreements">
              <h3 id="feat-agreements">Automated legal agreements (PDF)</h3>
              <p>
                For every engagement, <CCInline /> can generate a clear,
                downloadable legal agreement outlining scope, timelines,
                deliverables, and payment terms.
              </p>

              <ul className="feature-benefits">
                <li><strong>Clarity:</strong> Clearly defines what is included and excluded.</li>
                <li><strong>Payment protection:</strong> Documents milestones and schedules.</li>
                <li><strong>Dispute reduction:</strong> Acts as a formal reference in case of conflicts.</li>
                <li><strong>Professional trust:</strong> Elevates designer credibility and client confidence.</li>
              </ul>
            </article>
          </div>
        </section>

        {/* =========================
            CTA
        ========================= */}
        <section className="about-cta card">
          <h2>Build your space with <CCInline /></h2>
          <p>
            Explore interior products, source raw materials, or collaborate with
            trusted designers — all from one premium platform.
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
