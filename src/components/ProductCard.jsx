import React, { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { ShoppingBasket, Plus, Minus } from 'lucide-react';

const ProductCard = ({ product, language: initialLanguage = 'english' }) => {
  const { addToCart } = useContext(StoreContext);
  const [qty, setQty] = useState(1);
  const [language, setLanguage] = useState(initialLanguage);

  useEffect(() => {
    setLanguage(initialLanguage);
  }, [initialLanguage]);
  // ── Variant selection ──────────────────────────────────────────────────────
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const selectedVariant = hasVariants ? product.variants[selectedVariantIdx] : null;
  const displayPrice = hasVariants ? selectedVariant.price : product.price;

  const displayName = language === 'telugu' ? (product.nameTe || product.name) : product.name;

  const handleAdd = () => {
    if (qty <= 0) return;
    const variantToAdd = hasVariants
      ? selectedVariant
      : { weight: '1kg', price: product.price };

    const success = addToCart(product.id, qty, variantToAdd, displayName);
    if (success) {
      setQty(1);
    } else {
      alert('Not enough stock available!');
    }
  };

  const isOutOfStock = product.stock <= 0;

  const categoryLabelMap = {
    pickles: { english: 'Pickles', telugu: 'పచ్చళ్ళు' },
    sweets: { english: 'Sweets', telugu: 'స్వీట్స్' },
    snacks: { english: 'Snacks', telugu: 'కారాలు' },
  };

  const categoryKey = String(product.category || '').toLowerCase();
  const categoryLabel = categoryLabelMap[categoryKey]?.[language] || product.category;

  return (
    <div className="product-card fade-in">
      <div className="image-container">
        <img
          src={product.image}
          alt={product.name}
          onError={e => { e.target.src = 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(product.name); }}
        />
        <div
          className="image-overlay"
          style={{ backgroundImage: `url('${product.image}')` }}
        />
        <div className="image-caption">
          <span>{displayName}</span>
          <span>₹{displayPrice}</span>
        </div>
        {isOutOfStock ? (
          <span className="badge stock-out">Out of Stock</span>
        ) : product.stock <= 5 ? (
          <span className="badge stock-low">Only {product.stock} left!</span>
        ) : null}
        <span className="badge cat-badge">{categoryLabel}</span>
      </div>

      <div className="card-content">
        <div className="product-top-row">
          <h3>{displayName}</h3>
          <div className="product-lang-switch">
            <button
              type="button"
              className={language === 'english' ? 'lang-btn active' : 'lang-btn'}
              onClick={() => setLanguage('english')}
            >EN</button>
            <button
              type="button"
              className={language === 'telugu' ? 'lang-btn active' : 'lang-btn'}
              onClick={() => setLanguage('telugu')}
            >TE</button>
          </div>
        </div>
        <p className="desc">{language === 'telugu' ? (product.descTe || product.desc) : product.desc}</p>

        {/* Weight variant selector */}
        {hasVariants && (
          <div className="variant-selector-wrapper">
            <span className="variant-label">Choose Weight:</span>
            <div className="variant-selector">
              {product.variants.map((v, i) => (
                <button
                  key={v.weight}
                  className={`variant-btn ${selectedVariantIdx === i ? 'active' : ''}`}
                  onClick={() => { setSelectedVariantIdx(i); setQty(1); }}
                  disabled={isOutOfStock}
                >
                  {v.weight}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="price">
          ₹{displayPrice}
          <span className="unit"> / {hasVariants ? selectedVariant.weight : 'kg'}</span>
        </div>

        <div className="card-actions">
          <div className={`qty-control ${isOutOfStock ? 'disabled' : ''}`}>
            <button
              className="qty-btn"
              onClick={() => setQty(Math.max(0, qty - 1))}
              disabled={isOutOfStock || qty === 0}
            >
              <Minus size={16} />
            </button>
            <span className="qty-val">{qty}</span>
            <button
              className="qty-btn"
              onClick={() => setQty(Math.min(product.stock, qty + 1))}
              disabled={isOutOfStock || qty >= product.stock}
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            className={`btn-add ${qty === 0 || isOutOfStock ? 'disabled' : ''}`}
            onClick={handleAdd}
            disabled={qty === 0 || isOutOfStock}
          >
            <ShoppingBasket size={18} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
