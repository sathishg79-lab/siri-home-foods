import React, { createContext, useState, useEffect } from 'react';

export const StoreContext = createContext();

// ── Default categories ─────────────────────────────────────────────────────
const defaultCategories = ['pickles', 'sweets', 'snacks'];

// ── Default products (with weight variants) ────────────────────────────────
const defaultProducts = [
  {
    id: 'p1', name: 'Mango Pickle (Avakaya)', nameTe: 'ఆవకాయ పచ్చడి', category: 'pickles',
    image: '/images/momssnacks/avakai-2.jpg', desc: 'Tangy and spicy traditional mango pickle.', descTe: 'పుంజుకున్న తియ్యటి, కారమైన సంప్రదాయ ఆవకాయ పచ్చడి.',
    variants: [
      { weight: '250g', price: 175 },
      { weight: '500g', price: 325 },
      { weight: '1kg',  price: 600 },
    ],
    stock: 10,
  },
  {
    id: 'p2', name: 'Ginger Pickle', nameTe: 'అల్లం పచ్చడి', category: 'pickles',
    image: '/images/momssnacks/allam-pachadi-3.jpg', desc: 'Zesty ginger pickle with a hint of garlic.', descTe: 'వెలికితియ్య పచ్చడి, వెన్నెల అల్లంతో.',
    variants: [
      { weight: '250g', price: 160 },
      { weight: '500g', price: 300 },
      { weight: '1kg',  price: 550 },
    ],
    stock: 15,
  },
  {
    id: 's1', name: 'Besan Laddu', nameTe: 'బేసన్‌లड्डూ', category: 'sweets',
    image: '/images/momssnacks/Besan-laddu.jpg', desc: 'Clarified butter and roasted gram flour sweets.', descTe: 'సుగంధి గియంలో వ్రోజా బేసన్‌తో చేసిన మృదువైన లడ్డూ.',
    variants: [
      { weight: '250g', price: 120 },
      { weight: '500g', price: 220 },
      { weight: '1kg',  price: 400 },
    ],
    stock: 20,
  },
  {
    id: 's2', name: 'Special Kova', nameTe: 'స్పెషల్ కొవ', category: 'sweets',
    image: '/images/momssnacks/azmeer-kalakand-2.jpg', desc: 'Milk solids cooked to perfection.', descTe: 'ఆరగని, క్రీమీగా పన్నీ పాకంలో తయారు చేసిన ప్రత్యేక కొవ.',
    variants: [
      { weight: '250g', price: 150 },
      { weight: '500g', price: 280 },
      { weight: '1kg',  price: 500 },
    ],
    stock: 5,
  },
  {
    id: 'n1', name: 'Crunchy Murukulu', nameTe: 'క్రంచి మురుకులు', category: 'snacks',
    image: '/images/momssnacks/Boondi-Mixture.jpg', desc: 'Savoury rice flour snacks.', descTe: 'ఉల్లిపాయగార్లతో రుచికరమైన బియ్యం పిండి మురుకులు.',
    variants: [
      { weight: '250g', price: 120 },
      { weight: '500g', price: 220 },
      { weight: '1kg',  price: 400 },
    ],
    stock: 50,
  },
];

// ── Default contact info ───────────────────────────────────────────────────
const defaultContact = {
  phone: '+91 9912142247',
  whatsapp: '919912142247',
  email: '',
  address: '',
  mapsUrl: 'https://www.google.com/maps?q=17.4064993,78.5987009&output=embed',
  socialMedia: [],
};

// ── Default banners ────────────────────────────────────────────────────────
const defaultBanners = [
  {
    id: 'b1',
    title: 'స్వచ్ఛమైన తెలుగింటి రుచులు',
    subtitle: 'Authentic traditional pickles & sweets, made with love.',
    image: '/images/momssnacks/BANNERSML.jpg'
  },
  {
    id: 'b2',
    title: 'Maa Inti Ruchulu',
    subtitle: 'Homemade goodness delivered straight to your door.',
    image: '/images/momssnacks/logo.png'
  }
];
const defaultBannerSettings = {
  speed: 5000,
  animation: 'slide'
};

// ── Migrate old products (no variants) to variant format ──────────────────
function migrateProducts(saved) {
  return saved.map(p => {
    // Don't migrate if it's explicitly marked as a single-price product
    if (p.noVariants) return p;

    if (!p.variants || p.variants.length === 0) {
      const base = p.price || 0;
      return {
        ...p,
        variants: [
          { weight: '250g', price: Math.round(base * 0.28) },
          { weight: '500g', price: Math.round(base * 0.55) },
          { weight: '1kg',  price: base },
        ],
      };
    }
    return p;
  });
}

// ─────────────────────────────────────────────────────────────────────────
export const StoreProvider = ({ children }) => {
  // Products
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('shf_products');
    return saved ? migrateProducts(JSON.parse(saved)) : defaultProducts;
  });

  // Cart  — each item carries { ...product, selectedVariant: {weight, price}, qty }
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('shf_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Categories
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('shf_categories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  // Contact Info
  const normalizeContact = (savedContact) => {
    const contact = { ...defaultContact, ...savedContact };
    if (contact.whatsapp === '919848305086') contact.whatsapp = '919912142247';
    if (contact.phone === '+91 9848305086') contact.phone = '+91 9912142247';
    return contact;
  };

  const [contactInfo, setContactInfo] = useState(() => {
    const saved = localStorage.getItem('shf_contact');
    return saved ? normalizeContact(JSON.parse(saved)) : defaultContact;
  });

  // Site logo (editable in admin) — default to public /logo.png
  const [siteLogo, setSiteLogo] = useState(() => {
    const saved = localStorage.getItem('shf_site_logo');
    try {
      return saved ? JSON.parse(saved) : '/logo.png';
    } catch (e) {
      return saved || '/logo.png';
    }
  });

  // Persist
  useEffect(() => { localStorage.setItem('shf_products',   JSON.stringify(products));    }, [products]);
  useEffect(() => { localStorage.setItem('shf_cart',       JSON.stringify(cart));         }, [cart]);
  useEffect(() => { localStorage.setItem('shf_categories', JSON.stringify(categories));   }, [categories]);
  useEffect(() => { localStorage.setItem('shf_contact',    JSON.stringify(contactInfo));  }, [contactInfo]);
  useEffect(() => { localStorage.setItem('shf_site_logo',  JSON.stringify(siteLogo));   }, [siteLogo]);
  // Banners
  const [banners, setBanners] = useState(() => {
    const saved = localStorage.getItem('shf_banners');
    return saved ? JSON.parse(saved) : defaultBanners;
  });

  const [bannerSettings, setBannerSettings] = useState(() => {
    const saved = localStorage.getItem('shf_banner_settings');
    return saved ? JSON.parse(saved) : defaultBannerSettings;
  });

  useEffect(() => { localStorage.setItem('shf_banners',         JSON.stringify(banners));        }, [banners]);
  useEffect(() => { localStorage.setItem('shf_banner_settings', JSON.stringify(bannerSettings)); }, [bannerSettings]);

  // ── Cart ──────────────────────────────────────────────────────────────────
  // cartKey = productId + variant weight e.g. "p1-500g"
  const addToCart = (productId, qty, selectedVariant, selectedName) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock < qty) return false;

    const selectionLabel = selectedName || product.name;
    const cartKey = `${productId}-${selectedVariant.weight}-${selectionLabel}`;
    setCart(prev => {
      const existing = prev.find(item => item.cartKey === cartKey);
      if (existing) {
        return prev.map(item =>
          item.cartKey === cartKey ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prev, { ...product, cartKey, selectedVariant, qty, displayName: selectionLabel }];
    });
    return true;
  };

  const removeFromCart = (cartKey) => {
    setCart(prev => prev.filter(item => item.cartKey !== cartKey));
  };

  const updateCartQty = (cartKey, qty) => {
    if (qty <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCart(prev => prev.map(item =>
      item.cartKey === cartKey ? { ...item, qty } : item
    ));
  };

  const clearCart = () => setCart([]);

  // ── Products ──────────────────────────────────────────────────────────────
  const addProduct = (newProduct) => {
    setProducts(prev => [...prev, { ...newProduct, id: `prod_${Date.now()}` }]);
  };

  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const editProduct = (productId, updatedData) => {
    setProducts(prev =>
      prev.map(p => p.id === productId ? { ...p, ...updatedData } : p)
    );
  };

  // ── Categories ────────────────────────────────────────────────────────────
  const addCategory = (name) => {
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
    if (!slug || categories.includes(slug)) return false;
    setCategories(prev => [...prev, slug]);
    return slug;
  };

  const deleteCategory = (slug) => {
    setCategories(prev => prev.filter(c => c !== slug));
  };

  // ── Contact Info ──────────────────────────────────────────────────────────
  const updateContactInfo = (updates) => {
    setContactInfo(prev => ({ ...prev, ...updates }));
  };

  const addSocialMedia = (entry) => {
    setContactInfo(prev => ({
      ...prev,
      socialMedia: [...(prev.socialMedia || []), { ...entry, id: `sm_${Date.now()}` }],
    }));
  };

  const updateSocialMedia = (id, updates) => {
    setContactInfo(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  };

  const deleteSocialMedia = (id) => {
    setContactInfo(prev => ({
      ...prev,
      socialMedia: prev.socialMedia.filter(s => s.id !== id),
    }));
  };

  // ── Banners ───────────────────────────────────────────────────────────────
  const addBanner = (b) => setBanners(prev => [...prev, { ...b, id: `bn_${Date.now()}` }]);
  const deleteBanner = (id) => setBanners(prev => prev.filter(b => b.id !== id));
  const updateBanner = (id, b) => setBanners(prev => prev.map(item => item.id === id ? { ...b, id } : item));
  const updateBannerSettings = (s) => setBannerSettings(prev => ({ ...prev, ...s }));

  // ── Checkout ──────────────────────────────────────────────────────────────
  const processCheckout = () => {
    // Group cart by product id to sum qtys
    const byProduct = {};
    cart.forEach(item => {
      byProduct[item.id] = (byProduct[item.id] || 0) + item.qty;
    });

    // Validate
    for (const [id, qty] of Object.entries(byProduct)) {
      const p = products.find(prod => prod.id === id);
      if (!p || p.stock < qty) return false;
    }

    // Deduct
    setProducts(prev =>
      prev.map(p => {
        const deduct = byProduct[p.id] || 0;
        return deduct > 0 ? { ...p, stock: p.stock - deduct } : p;
      })
    );

    clearCart();
    return true;
  };

  return (
    <StoreContext.Provider value={{
      products, cart, categories, contactInfo,
      siteLogo, setSiteLogo,
      addToCart, removeFromCart, updateCartQty, clearCart,
      addProduct, deleteProduct, editProduct,
      addCategory, deleteCategory,
      updateContactInfo, addSocialMedia, updateSocialMedia, deleteSocialMedia,
      processCheckout,
      banners, addBanner, deleteBanner, updateBanner,
      bannerSettings, updateBannerSettings
    }}>
      {children}
    </StoreContext.Provider>
  );
};
