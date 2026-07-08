import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { Heart, Leaf, Sparkles, Truck, ArrowLeft } from 'lucide-react';

const About = () => {
  const { siteLogo, contactInfo } = useContext(StoreContext);
  return (
    <div className="about-page fade-in">
      <section className="page-hero about-hero">
        <div className="hero-left">
          <Link to="/" className="hero-back-link"><ArrowLeft size={18} /> Back to Shop</Link>
          <div className="hero-copy">
            <span className="eyebrow">Siri Home Foods</span>
            <h1>Made at home, served with love.</h1>
            <p>We preserve traditional Telugu tastes using time-honored recipes, premium ingredients and careful small-batch cooking. Every pickle, sweet and snack is handcrafted for freshness and flavor.</p>
            <div className="hero-actions-grid">
              <div className="hero-feature-card">
                <Heart size={24} />
                <div>
                  <strong>Crafted by family</strong>
                  <p>Recipes that pass through generations.</p>
                </div>
              </div>
              <div className="hero-feature-card">
                <Leaf size={24} />
                <div>
                  <strong>Natural ingredients</strong>
                  <p>No artificial preservatives or colors.</p>
                </div>
              </div>
              <div className="hero-feature-card">
                <Sparkles size={24} />
                <div>
                  <strong>Authentic flavors</strong>
                  <p>Freshly made with the right spice balance.</p>
                </div>
              </div>
              <div className="hero-feature-card">
                <Truck size={24} />
                <div>
                  <strong>Easy ordering</strong>
                  <p>WhatsApp and online checkout options available.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="about-hero-card">
            <img src={siteLogo || '/logo.png'} alt="Siri Home Foods Logo" className="about-logo" />
            <div className="about-card-copy">
              <h3>Our Promise</h3>
              <p>From our kitchen to your home, we make every order with care, clean packaging, and fresh ingredients.</p>
            </div>
          </div>
          <div className="about-stat-grid">
            <div className="about-stat">
              <strong>100% Homemade</strong>
              <span>Small-batch cooking daily.</span>
            </div>
            <div className="about-stat">
              <strong>5+ Categories</strong>
              <span>Sweets, pickles, snacks and more.</span>
            </div>
            <div className="about-stat">
              <strong>Delivery Support</strong>
              <span>Local drop-offs and express packing.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="story-section">
        <h2>Why Siri Home Foods?</h2>
        <div className="story-grid">
          <article>
            <h3>Home-style cooking</h3>
            <p>We use traditional techniques and home-cooked patience to create pickles, sweets and snacks that feel like a warm hug from Amma.</p>
          </article>
          <article>
            <h3>Ingredients you can trust</h3>
            <p>Every batch uses fresh vegetables, spices, and dairy sourced with care. No artificial additives, no hidden preservatives.</p>
          </article>
          <article>
            <h3>Fast contact</h3>
            <p>Ask questions, send orders, or request customised boxes directly through WhatsApp or phone.</p>
          </article>
        </div>
      </section>

      <section className="about-cta-section">
        <div>
          <h2>Ready to taste authentic Telugu flavours?</h2>
          <p>Explore our shop, select your favourites, and order fresh home foods in minutes.</p>
        </div>
        <div className="about-cta-actions">
          <Link to="/" className="btn-primary">Shop Now</Link>
          {contactInfo.whatsapp && (
            <a href={`https://api.whatsapp.com/send?phone=${contactInfo.whatsapp}`} target="_blank" rel="noreferrer" className="btn-secondary">Chat on WhatsApp</a>
          )}
        </div>
      </section>
    </div>
  );
};

export default About;
