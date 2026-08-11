import React, { createContext, useState, useEffect } from 'react';
import { db, ref, get, set, onValue, remove } from '../firebaseConfig';

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

  // ── Banners ───────────────────────────────────────────────────────────
  const [banners, setBanners] = useState(() => {
    const saved = localStorage.getItem('shf_banners');
    return saved ? JSON.parse(saved) : defaultBanners;
  });

  const [bannerSettings, setBannerSettings] = useState(() => {
    const saved = localStorage.getItem('shf_banner_settings');
    return saved ? JSON.parse(saved) : defaultBannerSettings;
  });

  // ── Firebase Sync & Persist ──────────────────────────────────────────────
  // Sync products to Firebase and listen for real-time updates
  useEffect(() => {
    localStorage.setItem('shf_products', JSON.stringify(products));
    set(ref(db, 'siteData/products'), products).catch(err => 
      console.warn('Failed to sync products to Firebase:', err)
    );
  }, [products]);

  // Sync cart to localStorage (cart is local-only, not synced to Firebase)
  useEffect(() => {
    localStorage.setItem('shf_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync categories to Firebase and listen for real-time updates
  useEffect(() => {
    localStorage.setItem('shf_categories', JSON.stringify(categories));
    set(ref(db, 'siteData/categories'), categories).catch(err => 
      console.warn('Failed to sync categories to Firebase:', err)
    );
  }, [categories]);

  // Sync contact info to Firebase and listen for real-time updates
  useEffect(() => {
    localStorage.setItem('shf_contact', JSON.stringify(contactInfo));
    set(ref(db, 'siteData/contactInfo'), contactInfo).catch(err => 
      console.warn('Failed to sync contactInfo to Firebase:', err)
    );
  }, [contactInfo]);

  // Sync site logo to Firebase
  useEffect(() => {
    localStorage.setItem('shf_site_logo', JSON.stringify(siteLogo));
    set(ref(db, 'siteData/siteLogo'), siteLogo).catch(err => 
      console.warn('Failed to sync siteLogo to Firebase:', err)
    );
  }, [siteLogo]);

  // Sync banners to Firebase
  useEffect(() => {
    localStorage.setItem('shf_banners', JSON.stringify(banners));
    set(ref(db, 'siteData/banners'), banners).catch(err => 
      console.warn('Failed to sync banners to Firebase:', err)
    );
  }, [banners]);

  // Sync banner settings to Firebase
  useEffect(() => {
    localStorage.setItem('shf_banner_settings', JSON.stringify(bannerSettings));
    set(ref(db, 'siteData/bannerSettings'), bannerSettings).catch(err => 
      console.warn('Failed to sync bannerSettings to Firebase:', err)
    );
  }, [bannerSettings]);

  // Try to load remote site data from Firebase (with real-time updates)
  useEffect(() => {
    let mounted = true;

    // Set up real-time listeners for products, categories, and contactInfo
    const unsubscribeProducts = onValue(
      ref(db, 'siteData/products'),
      (snapshot) => {
        if (!mounted) return;
        const data = snapshot.val();
        if (data) {
          const migratedData = migrateProducts(data);
          setProducts(migratedData);
        }
      },
      (err) => console.warn('Failed to load products from Firebase:', err)
    );

    const unsubscribeCategories = onValue(
      ref(db, 'siteData/categories'),
      (snapshot) => {
        if (!mounted) return;
        const data = snapshot.val();
        if (data && Array.isArray(data)) {
          setCategories(data);
        }
      },
      (err) => console.warn('Failed to load categories from Firebase:', err)
    );

    const unsubscribeContactInfo = onValue(
      ref(db, 'siteData/contactInfo'),
      (snapshot) => {
        if (!mounted) return;
        const data = snapshot.val();
        if (data) {
          setContactInfo(normalizeContact(data));
        }
      },
      (err) => console.warn('Failed to load contactInfo from Firebase:', err)
    );

    const unsubscribeBanners = onValue(
      ref(db, 'siteData/banners'),
      (snapshot) => {
        if (!mounted) return;
        const data = snapshot.val();
        if (data && Array.isArray(data)) {
          setBanners(data);
        }
      },
      (err) => console.warn('Failed to load banners from Firebase:', err)
    );

    const unsubscribeBannerSettings = onValue(
      ref(db, 'siteData/bannerSettings'),
      (snapshot) => {
        if (!mounted) return;
        const data = snapshot.val();
        if (data) {
          setBannerSettings(data);
        }
      },
      (err) => console.warn('Failed to load bannerSettings from Firebase:', err)
    );

    const unsubscribeSiteLogo = onValue(
      ref(db, 'siteData/siteLogo'),
      (snapshot) => {
        if (!mounted) return;
        const data = snapshot.val();
        if (data) {
          setSiteLogo(data);
        }
      },
      (err) => console.warn('Failed to load siteLogo from Firebase:', err)
    );

    const unsubscribeOrders = onValue(
      ref(db, 'siteData/orders'),
      (snapshot) => {
        if (!mounted) return;
        const data = snapshot.val();
        if (data && Array.isArray(data)) {
          setOrders(data);
        }
      },
      (err) => console.warn('Failed to load orders from Firebase:', err)
    );

    // Cleanup subscriptions on unmount
    return () => {
      mounted = false;
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeContactInfo();
      unsubscribeBanners();
      unsubscribeBannerSettings();
      unsubscribeSiteLogo();
      unsubscribeOrders();
    };
  }, []);

  // Try to load remote site data from serverless function (if available)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/.netlify/functions/getSiteData');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted || !data) return;
        if (data.products) setProducts(migrateProducts(data.products));
        if (data.categories) setCategories(data.categories);
        if (data.contactInfo) setContactInfo(normalizeContact(data.contactInfo));
        if (data.banners) setBanners(data.banners);
        if (data.bannerSettings) setBannerSettings(data.bannerSettings || defaultBannerSettings);
        if (data.siteLogo) setSiteLogo(data.siteLogo);
      } catch (err) {
        // ignore; remote data optional
        // console.warn('Failed to load remote site data', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

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

  // ── Order History ────────────────────────────────────────────────────────
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('shf_orders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { 
    localStorage.setItem('shf_orders', JSON.stringify(orders));
    set(ref(db, 'siteData/orders'), orders).catch(err => 
      console.warn('Failed to sync orders to Firebase:', err)
    );
  }, [orders]);

  const saveOrder = (orderData) => {
    const order = {
      id: `order_${Date.now()}`,
      timestamp: new Date().toISOString(),
      customerName: orderData.name,
      phone: orderData.phone,
      address: orderData.address,
      items: cart.map(item => ({
        productId: item.id,
        productName: item.displayName || item.name,
        variant: item.selectedVariant,
        qty: item.qty,
        price: item.selectedVariant?.price || item.price
      })),
      total: cart.reduce((sum, item) => {
        const price = item.selectedVariant?.price || item.price || 0;
        return sum + (price * item.qty);
      }, 0),
      status: 'pending', // pending, confirmed, dispatched, delivered
      paymentMethod: orderData.paymentMethod || 'whatsapp'
    };
    setOrders(prev => [order, ...prev]);
    return order;
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const getOrderHistory = (phone) => {
    if (!phone) return orders;
    return orders.filter(o => o.phone === phone);
  };

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
      bannerSettings, updateBannerSettings,
      orders, saveOrder, updateOrderStatus, getOrderHistory
    }}>
      {children}
    </StoreContext.Provider>
  );
};
