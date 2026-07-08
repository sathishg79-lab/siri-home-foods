import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, ArrowLeft } from 'lucide-react';

const PLATFORM_ICONS = {
  instagram: '📸',
  facebook:  '📘',
  youtube:   '▶️',
  twitter:   '🐦',
  whatsapp:  '💬',
  other:     '🔗',
};

const ContactUs = () => {
  const { contactInfo } = useContext(StoreContext);
  const { phone, whatsapp, email, address, mapsUrl, socialMedia = [] } = contactInfo;

  return (
    <div className="contact-premium-layout fade-in">
      {/* Premium Header/Hero */}
      <header className="contact-premium-hero">
        <div className="contact-hero-content">
          <Link to="/" className="contact-back-link"><ArrowLeft size={18} /> Back to Shop</Link>
          <div className="hero-text-content">
            <h1>మాతో కనెక్ట్ అవ్వండి</h1>
            <p>Maa Inti Ruchulu. We're here to help you experience the true, authentic taste of traditional homemade goodness. Reach out to us anytime.</p>
          </div>
        </div>
      </header>

      {/* Main Container constrained */}
      <div className="contact-premium-container">
        
        <div className="contact-premium-grid slide-up">
          {phone && (
            <a href={`tel:${phone}`} className="premium-card premium-card-phone">
              <div className="card-bg-gradient"></div>
              <div className="icon-wrapper"><Phone size={32} /></div>
              <div className="card-info">
                <h4>Call Us</h4>
                <p>{phone}</p>
              </div>
            </a>
          )}

          {whatsapp && (
            <a href={`https://api.whatsapp.com/send?phone=${whatsapp}`} target="_blank" rel="noreferrer" className="premium-card premium-card-whatsapp">
              <div className="card-bg-gradient"></div>
              <div className="icon-wrapper"><MessageCircle size={32} /></div>
              <div className="card-info">
                <h4>WhatsApp</h4>
                <p>Chat with us</p>
              </div>
            </a>
          )}

          {email && (
            <a href={`mailto:${email}`} className="premium-card premium-card-email">
              <div className="card-bg-gradient"></div>
              <div className="icon-wrapper"><Mail size={32} /></div>
              <div className="card-info">
                <h4>Email</h4>
                <p>{email}</p>
              </div>
            </a>
          )}

          {address && (
            <div className="premium-card premium-card-address">
              <div className="card-bg-gradient"></div>
              <div className="icon-wrapper"><MapPin size={32} /></div>
              <div className="card-info">
                <h4>Location</h4>
                <p>{address}</p>
              </div>
            </div>
          )}
        </div>

        {socialMedia.length > 0 && (
          <section className="premium-social-section slide-up">
            <h3 className="premium-section-title">Join Our Community</h3>
            <div className="premium-social-grid">
              {socialMedia.map(sm => {
                const rawUrl = String(sm.url || '').trim();
                const socialLink = rawUrl ? (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`) : null;
                const Wrapper = socialLink ? 'a' : 'div';
                const wrapperProps = socialLink ? { href: socialLink, target: '_blank', rel: 'noreferrer' } : {};

                return (
                  <Wrapper
                    key={sm.id}
                    className={`premium-social-card ${socialLink ? '' : 'no-link'}`}
                    style={{ '--sm-color': sm.color || '#D35400' }}
                    {...wrapperProps}
                  >
                    <div className="social-banner-premium">
                      {PLATFORM_ICONS[sm.platform] || PLATFORM_ICONS.other}
                    </div>
                    <div className="social-content-premium">
                      <h4>{sm.platform.charAt(0).toUpperCase() + sm.platform.slice(1)}</h4>
                      <p>{sm.handle || 'Tap to visit'}</p>
                      {sm.qrBase64 && (
                        <div className="social-qr-premium">
                          <img src={sm.qrBase64} alt={`${sm.platform} QR`} />
                          <span>{socialLink ? 'Scan or tap to visit' : 'Scan this QR code'}</span>
                        </div>
                      )}
                      {!socialLink && (
                        <p style={{ marginTop: '12px', color: '#666', fontSize:'0.95rem' }}>
                          No destination provided yet. Add a URL in admin so scans open directly.
                        </p>
                      )}
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          </section>
        )}

        {mapsUrl && (
          <section className="premium-map-section slide-up">
            <h3 className="premium-section-title">Find Us on the Map</h3>
            <div className="premium-map-container">
              <iframe
                src={mapsUrl}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Siri Home Foods Location"
              />
            </div>
          </section>
        )}
      </div>
      
      <footer className="contact-premium-footer">
        <p>© 2024 Siri Home Foods. All Rights Reserved.</p>
        <Link to="/" className="footer-link">Return to Shop</Link>
      </footer>
    </div>
  );
};

export default ContactUs;
