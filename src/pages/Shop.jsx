import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { ShoppingBag, MapPin, Phone, User, CheckCircle, CreditCard } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';

// ── Razorpay Key ─────────────────────────────────────────────────────────────
// Replace with your actual Key ID from https://dashboard.razorpay.com/
const RAZORPAY_KEY_ID = 'YOUR_RAZORPAY_KEY_ID';

function loadRazorpayScript() {
  return new Promise(resolve => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id  = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const Shop = () => {
  const { 
    products, cart, categories, removeFromCart, clearCart, processCheckout,
    banners, bannerSettings, siteLogo
  } = useContext(StoreContext);
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState(() => localStorage.getItem('shf_language') || 'english');
  const [checkoutData,   setCheckoutData]   = useState({ name: '', phone: '', address: '' });
  const [orderPlaced,    setOrderPlaced]     = useState(false);
  const [payLoading,     setPayLoading]      = useState(false);

  const categoryLabelMap = {
    all: { english: 'All', telugu: 'అన్ని' },
    pickles: { english: 'Pickles', telugu: 'పచ్చళ్ళు' },
    sweets: { english: 'Sweets', telugu: 'స్వీట్స్' },
    snacks: { english: 'Snacks', telugu: 'కారాలు' },
  };

  const getCategoryLabel = (slug) => {
    const key = String(slug || '').toLowerCase();
    return categoryLabelMap[key]?.[language] || slug;
  };

  useEffect(() => { localStorage.setItem('shf_language', language); }, [language]);

  // ── Banner Rotation ───────────────────────────────────────────────────────
  const [currentIdx, setCurrentIdx] = useState(0);
  const [prevIdx,    setPrevIdx]    = useState(-1);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setPrevIdx(currentIdx);
      setCurrentIdx(prev => (prev + 1) % banners.length);
    }, bannerSettings.speed || 5000);
    return () => clearInterval(interval);
  }, [banners, currentIdx, bannerSettings.speed]);

  const filteredProducts = (activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory))
    .filter(p => {
      if (!query || query.trim() === '') return true;
      const q = query.toLowerCase();
      return (p.name && p.name.toLowerCase().includes(q)) || (p.nameTe && p.nameTe.toLowerCase().includes(q)) || (p.desc && p.desc.toLowerCase().includes(q));
    });

  // Cart total uses selectedVariant price
  const cartTotal = cart.reduce((acc, item) => {
    const price = item.selectedVariant ? item.selectedVariant.price : (item.price || 0);
    return acc + price * item.qty;
  }, 0);

  const validate = () => {
    if (!checkoutData.name || !checkoutData.phone || !checkoutData.address) {
      alert('Please fill all delivery details.'); return false;
    }
    if (cart.length === 0) { alert('Your basket is empty.'); return false; }
    return true;
  };

  // ── WhatsApp Order ───────────────────────────────────────────────────────
  const handleWhatsApp = () => {
    if (!validate()) return;
    const success = processCheckout();
    if (!success) { alert('Some items exceed available stock. Please review.'); return; }

    setOrderPlaced(true);
    const number = '919912142247';
    const rawMessage = `*New Order — Siri Home Foods*\n\n*Name:* ${checkoutData.name}\n*Phone:* ${checkoutData.phone}\n*Address:* ${checkoutData.address}\n\n*Items:*\n` +
      cart.map(i => {
        const price = i.selectedVariant ? i.selectedVariant.price : i.price;
        const weight = i.selectedVariant ? i.selectedVariant.weight : '1kg';
        return `• ${i.name} (${weight} × ${i.qty}) — ₹${price * i.qty}`;
      }).join('\n') +
      `\n\n*Total: ₹${cartTotal}*`;
    const encodedMessage = encodeURIComponent(rawMessage);
    const whatsappUrl = `https://wa.me/${number}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setTimeout(() => { setOrderPlaced(false); setCheckoutData({ name: '', phone: '', address: '' }); }, 4000);
  };

  // ── Razorpay Payment ─────────────────────────────────────────────────────
  const handleRazorpay = async () => {
    if (!validate()) return;

    if (RAZORPAY_KEY_ID === 'YOUR_RAZORPAY_KEY_ID') {
      alert('⚠️ Razorpay Key not set.\n\nPlease add your Razorpay Key ID in src/pages/Shop.jsx to enable online payments.\n\nVisit: https://dashboard.razorpay.com/');
      return;
    }

    setPayLoading(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) { alert('Failed to load payment gateway. Check your internet connection.'); setPayLoading(false); return; }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: cartTotal * 100,
      currency: 'INR',
      name: 'Siri Home Foods',
      description: 'Authentic Homemade Pickles & Sweets',
      image: siteLogo || '/logo.png',
      prefill: { name: checkoutData.name, contact: checkoutData.phone },
      notes: { address: checkoutData.address },
      theme: { color: '#D35400' },
      handler: function(response) {
        const success = processCheckout();
        if (success) {
          setOrderPlaced(true);
          alert(`✅ Payment Successful!\nPayment ID: ${response.razorpay_payment_id}\n\nThank you, ${checkoutData.name}!`);
          setTimeout(() => { setOrderPlaced(false); setCheckoutData({ name: '', phone: '', address: '' }); }, 5000);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => alert('❌ Payment failed. Please try again.'));
    rzp.open();
    setPayLoading(false);
  };

  // Category emoji map
  const catEmoji = { all: '🍽️', pickles: '🫙', sweets: '🍬', snacks: '🥨' };

  return (
    <div className="shop-layout">
      {/* Background Heritage Decor */}
      <div className="heritage-decor decor-deepam">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 L65 45 L50 55 L35 45 Z" fill="#F1C40F" opacity="0.8"/><path d="M20 55 Q50 95 80 55 L20 55" fill="#D35400"/></svg>
      </div>
      <div className="heritage-decor decor-flower">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#F39C12" opacity="0.6"/><circle cx="50" cy="50" r="25" fill="#E67E22" opacity="0.7"/><circle cx="50" cy="50" r="10" fill="#D35400"/></svg>
      </div>
      <div className="heritage-decor decor-leaf">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 5 Q85 50 50 95 Q15 50 50 5" fill="#27AE60" opacity="0.4"/></svg>
      </div>

      {/* HEADER */}
      <header className="main-header">
        <div className="header-content">
          <div className="logo-container">
            <Link to="/">
              <img src={siteLogo || '/logo.png'} alt="Siri Home Foods" className="header-logo" />
            </Link>
          </div>

          <div className="header-search">
            <div className="search-box">
              <input value={query} onChange={e => setQuery(e.target.value)} type="search" placeholder="Search for products..." aria-label="Search products" />
            </div>
          </div>

          <div className="cart-bubble">
            <Link to="/contact" className="admin-link">📞 Contact Us</Link>
            <Link to="/admin" className="admin-link">⚙️ Admin Portal</Link>
            <Link to="/cart" className="cart-link">
              🛒 <span>My Cart</span>
              <span className="cart-count">{cart.length}</span>
            </Link>
          </div>
        </div>
        <div className="insta-tag">@siri_home_foods</div>
      </header>

      {/* TOP NAV */}
      <nav className="top-nav">
        <div className="nav-inner">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>About Us</NavLink>
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Order Online</NavLink>
          <NavLink to="/faq" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>FAQ</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Contact Us</NavLink>
        </div>
      </nav>

      <div className="main-container">
        <div className="content-area">
          {/* DYNAMIC BANNER CAROUSEL */}
          {banners.length > 0 && (
            <div className="banner-carousel slide-up">
              {banners.map((b, idx) => {
                let status = '';
                if (idx === currentIdx) status = 'active';
                else if (idx === prevIdx) status = 'exit';
                
                return (
                  <div 
                    key={b.id} 
                    className={`banner-container ${status}`}
                    style={{ backgroundImage: `url('${b.image}')` }}
                  >
                    <div className="banner-overlay">
                      <h2 className="ecz-font">{b.title}</h2>
                      <p>{b.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="hero-summary slide-up">
            <div className="hero-text">
              <span className="eyebrow">Premium Homemade Snacks</span>
              <h2>Delicious Indian sweets, pickles and crunchy favorites.</h2>
              <p>Order fresh, handcrafted products made in small batches with authentic flavor. Tap any item below to add it to your basket and checkout instantly.</p>
              <div className="hero-actions">
                <span>Choose from sweets, snacks, and pickles with vivid product photos.</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-circle" style={{ backgroundImage: "url('/images/momssnacks/azmeer-kalakand-2.jpg')" }} />
              <div className="hero-circle" style={{ backgroundImage: "url('/images/momssnacks/Besan-laddu.jpg')" }} />
              <div className="hero-circle" style={{ backgroundImage: "url('/images/momssnacks/Boondi-Mixture.jpg')" }} />
            </div>
            <div className="hero-features">
              <div className="feature-chip">No preservatives</div>
              <div className="feature-chip">Fresh daily batches</div>
              <div className="feature-chip">Delivery-ready packs</div>
              <div className="feature-chip">Easy WhatsApp ordering</div>
            </div>
          </div>

          {/* DYNAMIC CATEGORIES */}
          <div className="language-picker">
            <span>Category language:</span>
            <button
              className={language === 'english' ? 'lang-btn active' : 'lang-btn'}
              onClick={() => setLanguage('english')}
            >English</button>
            <button
              className={language === 'telugu' ? 'lang-btn active' : 'lang-btn'}
              onClick={() => setLanguage('telugu')}
            >తెలుగు</button>
          </div>

          <div className="categories slide-up">
            <button
              className={`cat-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              {catEmoji['all']} {getCategoryLabel('all')}
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {catEmoji[cat.toLowerCase()] || '🏷️'} {getCategoryLabel(cat)}
              </button>
            ))}
          </div>

          {/* PRODUCTS */}
          <div className="product-grid">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} language={language} />
            ))}
            {filteredProducts.length === 0 && (
              <div className="empty-state">No products in this category yet.</div>
            )}
          </div>
        </div>

        {/* SIDEBAR CART */}
        <aside className="cart-sidebar slide-left">
          <div className="cart-header">
            <div className="cart-title-group">
              <ShoppingBag size={24} />
              <h3>Your Basket</h3>
            </div>
            {cart.length > 0 && (
              <button className="btn-clear" onClick={clearCart}>Clear Basket</button>
            )}
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <p className="empty-cart">Your basket is empty</p>
            ) : (
              cart.map(item => {
                const price = item.selectedVariant ? item.selectedVariant.price : (item.price || 0);
                const weight = item.selectedVariant ? item.selectedVariant.weight : '1kg';
                return (
                  <div key={item.cartKey} className="cart-item fade-in">
                    <div className="item-info">
                      <strong>{item.displayName || item.name}</strong>
                      <span>{weight} × {item.qty} unit{item.qty > 1 ? 's' : ''}</span>
                    </div>
                    <div className="item-actions">
                      <span className="item-total">₹{price * item.qty}</span>
                      <button onClick={() => removeFromCart(item.cartKey)} className="remove-btn">&times;</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="cart-footer">
            <div className="total-box">
              <span>Total Amount:</span>
              <span className="total-amount">₹{cartTotal}</span>
            </div>

            {cart.length > 0 && (
              <div className="checkout-form">
                <h4>Delivery Details</h4>
                <div className="input-group">
                  <User size={18} />
                  <input type="text" placeholder="Full Name" value={checkoutData.name} onChange={e => setCheckoutData({...checkoutData, name: e.target.value})} />
                </div>
                <div className="input-group">
                  <Phone size={18} />
                  <input type="tel" placeholder="WhatsApp Number" value={checkoutData.phone} onChange={e => setCheckoutData({...checkoutData, phone: e.target.value})} />
                </div>
                <div className="input-group align-start">
                  <MapPin size={18} style={{ marginTop: '12px' }} />
                  <textarea rows="2" placeholder="Delivery Address" value={checkoutData.address} onChange={e => setCheckoutData({...checkoutData, address: e.target.value})}></textarea>
                </div>

                {orderPlaced ? (
                  <button className="btn-success">
                    <CheckCircle size={20} /> Order Confirmed!
                  </button>
                ) : (
                  <div className="payment-buttons">
                    <button className="btn-whatsapp" onClick={handleWhatsApp}>
                      <span>📲</span> Order via WhatsApp
                    </button>
                    <button className="btn-razorpay" onClick={handleRazorpay} disabled={payLoading}>
                      <CreditCard size={18} />
                      {payLoading ? 'Loading…' : 'Pay Online (UPI / Card)'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Shop;
