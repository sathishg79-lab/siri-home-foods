import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Clock3, Truck, ShieldCheck, Smartphone } from 'lucide-react';

const faqItems = [
  {
    question: 'How do I place an order?',
    answer: 'Browse products, add items to your basket, then choose WhatsApp or online checkout from the cart sidebar.'
  },
  {
    question: 'Can I order in Telugu language?',
    answer: 'Yes. Product names and descriptions are available in Telugu as well as English, and you can contact us in Telugu on WhatsApp.'
  },
  {
    question: 'Do you deliver locally?',
    answer: 'We offer local delivery and pickup options. Reach out through WhatsApp for exact delivery locations and timings.'
  },
  {
    question: 'What payment methods are available?',
    answer: 'You can place orders by WhatsApp or use online payment if Razorpay is configured in the app.'
  },
  {
    question: 'Can I request custom quantities or a gift pack?',
    answer: 'Absolutely. Send us a message on WhatsApp or contact us and we will prepare a custom pack for you.'
  },
];

const Faq = () => {
  return (
    <div className="faq-page fade-in">
      <section className="page-hero faq-hero">
        <div className="hero-copy">
          <Link to="/" className="hero-back-link"><ArrowLeft size={18} /> Back to Shop</Link>
          <span className="eyebrow">FAQs</span>
          <h1>Common questions answered.</h1>
          <p>Learn how Siri Home Foods works, what to expect from ordering, and how to get help fast.</p>
        </div>
        <div className="hero-stat-grid">
          <div className="hero-stat-card">
            <HelpCircle size={28} />
            <strong>Simple process</strong>
            <span>Add items, checkout, and confirm via WhatsApp or online payment.</span>
          </div>
          <div className="hero-stat-card">
            <Clock3 size={28} />
            <strong>Fresh batches</strong>
            <span>Products are made fresh in small quantities for every order.</span>
          </div>
          <div className="hero-stat-card">
            <Truck size={28} />
            <strong>Fast support</strong>
            <span>Reach out through WhatsApp and get a quick response.</span>
          </div>
          <div className="hero-stat-card">
            <ShieldCheck size={28} />
            <strong>Clean packaging</strong>
            <span>Each item is packed neatly and safely for delivery.</span>
          </div>
        </div>
      </section>

      <section className="faq-list">
        {faqItems.map(item => (
          <article key={item.question} className="faq-item">
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </section>

      <section className="faq-help-card slide-up">
        <div>
          <h2>Need more help?</h2>
          <p>If your question is not listed here, contact us directly and we will assist you with your order.</p>
        </div>
        <Link to="/contact" className="btn-primary">Contact Us</Link>
      </section>
    </div>
  );
};

export default Faq;
