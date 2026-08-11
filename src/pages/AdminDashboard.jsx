import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Edit3, Package, Lock, LogOut,
  BarChart2, ShoppingBag, TrendingUp, AlertTriangle,
  Key, Eye, EyeOff, Check, X, Phone, Mail, Globe, Tag, Monitor
} from 'lucide-react';

// ─── Secure password helpers ───────────────────────────────────────────────
// We hash the password before storing it so the plain-text is never kept in
// localStorage.  This uses the browser's built-in SubtleCrypto API.
async function hashPassword(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Compare a plain-text attempt against the stored hash
async function verifyPassword(plain, storedHash) {
  const attempt = await hashPassword(plain);
  return attempt === storedHash;
}

// ─── Default admin password hash (used only to seed storage on first run) ───
// This value is a SHA-256 digest. It is never stored or displayed as plain text.
const DEFAULT_PASSWORD_HASH = 'fe9bda56393603e024b056efd2317d2ae264a4c56a61130cb75f834c523c9302';
const ADMIN_RECOVERY_PHONE = '919848305086';

const ADMIN_HASH_KEY  = 'shf_admin_pw_hash';
const ADMIN_AUTH_KEY  = 'shf_admin_auth';

// ───────────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { 
    products, addProduct, deleteProduct, editProduct,
    categories, addCategory, deleteCategory,
    contactInfo, updateContactInfo, addSocialMedia, deleteSocialMedia, updateSocialMedia,
    banners, addBanner, deleteBanner, updateBanner, bannerSettings, updateBannerSettings,
    siteLogo, setSiteLogo, publishSiteData
  } = useContext(StoreContext);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPw, setLoginPw]   = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginError, setLoginError]   = useState('');

  // ── Active tab ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('inventory');

  // ── Product form ───────────────────────────────────────────────────────────
  const [isAdding,  setIsAdding]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData,  setFormData]  = useState({
    name: '', category: 'pickles', stock: '', image: '', desc: '',
    price250: '', price500: '', price1kg: '', hasVariants: true
  });

  // ── Contact Info & Category States ─────────────────────────────────────────
  const [newCatName, setNewCatName] = useState('');
  const [language, setLanguage] = useState(() => localStorage.getItem('shf_admin_category_language') || 'english');
  const [socialForm, setSocialForm] = useState({ platform: 'instagram', handle: '', url: '', color: '#D35400', qrBase64: '' });
  const [socialError, setSocialError] = useState('');
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  const [editingSocialId, setEditingSocialId] = useState(null);

  const categoryLabelMap = {
    all: { english: 'All', telugu: 'అన్ని' },
    pickles: { english: 'Pickles', telugu: 'పచ్చళ్ళు' },
    sweets: { english: 'Sweets', telugu: 'స్వీట్స్' },
    snacks: { english: 'Snacks', telugu: 'కారాలు' },
  };

  const getCategoryLabel = (slug) => {
    const key = String(slug || '').toLowerCase();
    if (categoryLabelMap[key] && categoryLabelMap[key][language]) {
      return categoryLabelMap[key][language];
    }
    return String(slug || '').charAt(0).toUpperCase() + String(slug || '').slice(1);
  };

  useEffect(() => {
    localStorage.setItem('shf_admin_category_language', language);
  }, [language]);

  // ── Banner States ──────────────────────────────────────────────────────────
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', image: '' });
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);

  // ── Password reset ─────────────────────────────────────────────────────────
  const [pwForm,     setPwForm]     = useState({ current: '', newPw: '', confirm: '' });
  const [showPwForm, setShowPwForm] = useState({ current: false, newPw: false, confirm: false });
  const [pwMsg,      setPwMsg]      = useState({ type: '', text: '' });
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotNewPw, setForgotNewPw] = useState('');
  const [forgotConfirm, setForgotConfirm] = useState('');
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });

  // ── The wrong hash that was hardcoded in a previous version of this file ──
  const OLD_BROKEN_HASH = 'b2e05427f2d50474a38c8bbcada1a7dc65cb5f52d7b1b42ff5a77a76c4ff0f7c';

  // ── Check session and seed/repair hash on mount ────────────────────────────
  useEffect(() => {
    if (localStorage.getItem(ADMIN_AUTH_KEY) === 'true') setIsAuthenticated(true);

    const stored = localStorage.getItem(ADMIN_HASH_KEY);
    // Seed if missing OR replace the old wrong hardcoded hash automatically.
    if (!stored || stored === OLD_BROKEN_HASH) {
      localStorage.setItem(ADMIN_HASH_KEY, DEFAULT_PASSWORD_HASH);
    }
  }, []);

  const handleForgotPasswordReset = async (e) => {
    e.preventDefault();
    setForgotMsg({ type: '', text: '' });

    const normalized = forgotPhone.replace(/\D/g, '');
    const savedPhone = contactInfo?.phone ? contactInfo.phone.replace(/\D/g, '') : '';
    if (normalized !== ADMIN_RECOVERY_PHONE && normalized !== savedPhone) {
      return setForgotMsg({ type: 'error', text: 'Mobile number does not match the registered admin recovery number.' });
    }

    if (forgotNewPw.length < 8) {
      return setForgotMsg({ type: 'error', text: 'Password must be at least 8 characters long.' });
    }

    if (forgotNewPw !== forgotConfirm) {
      return setForgotMsg({ type: 'error', text: 'Passwords do not match.' });
    }

    const hash = await hashPassword(forgotNewPw);
    localStorage.setItem(ADMIN_HASH_KEY, hash);
    localStorage.removeItem(ADMIN_AUTH_KEY);

    setForgotMsg({ type: 'success', text: 'Password has been reset successfully. Please log in with your new password.' });
    setForgotPhone('');
    setForgotNewPw('');
    setForgotConfirm('');
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const storedHash = localStorage.getItem(ADMIN_HASH_KEY);
    if (!storedHash) {
      setLoginError('Password not initialised yet — please wait 1 second and try again.');
      return;
    }
    const ok = await verifyPassword(loginPw, storedHash);
    if (ok) {
      setIsAuthenticated(true);
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
    setLoginPw('');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(ADMIN_AUTH_KEY);
  };

  // ── Password reset ─────────────────────────────────────────────────────────
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });

    const storedHash = localStorage.getItem(ADMIN_HASH_KEY);
    const currentOk  = await verifyPassword(pwForm.current, storedHash);

    if (!currentOk)               return setPwMsg({ type: 'error', text: 'Current password is incorrect.' });
    if (pwForm.newPw.length < 8)  return setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
    if (pwForm.newPw !== pwForm.confirm) return setPwMsg({ type: 'error', text: 'Passwords do not match.' });

    const newHash = await hashPassword(pwForm.newPw);
    localStorage.setItem(ADMIN_HASH_KEY, newHash);
    setPwMsg({ type: 'success', text: 'Password updated successfully!' });
    setPwForm({ current: '', newPw: '', confirm: '' });
  };

  // ── Product CRUD helpers ───────────────────────────────────────────────────
  const openAddForm = () => {
    setEditingId(null);
    setFormData({ 
      name: '', category: 'pickles', stock: '', image: '', desc: '',
      price250: '', price500: '', price1kg: '', hasVariants: true
    });
    setIsAdding(true);
  };
  const openEditForm = (p) => {
    setIsAdding(false);
    setEditingId(p.id);
    const p250 = p.variants?.find(v => v.weight === '250g')?.price || '';
    const p500 = p.variants?.find(v => v.weight === '500g')?.price || '';
    const p1kg = p.variants?.find(v => v.weight === '1kg')?.price || p.price || '';
    const hasVariants = !!(p.variants && p.variants.length > 0);
    setFormData({ 
      name: p.name, category: p.category, stock: p.stock, image: p.image, desc: p.desc,
      price250: p250, price500: p500, price1kg: p1kg, hasVariants
    });
  };
  const closeForm = () => { setIsAdding(false); setEditingId(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || formData.price1kg === '' || formData.stock === '') {
      alert('Please fill Name, 1kg Price, and Stock.'); return;
    }
    const variants = formData.hasVariants ? [
      { weight: '250g', price: Number(formData.price250) || Math.round(Number(formData.price1kg)*0.28) },
      { weight: '500g', price: Number(formData.price500) || Math.round(Number(formData.price1kg)*0.55) },
      { weight: '1kg',  price: Number(formData.price1kg) }
    ] : [];

    const payload = { 
      name: formData.name, category: formData.category, desc: formData.desc,
      stock: Number(formData.stock), image: formData.image || '/images/pickle.png',
      variants, price: Number(formData.price1kg),
      noVariants: !formData.hasVariants
    };
    if (isAdding)        addProduct(payload);
    else if (editingId)  editProduct(editingId, payload);
    closeForm();
  };

  // ── Categories & Contact Handlers ──────────────────────────────────────────
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCatName) {
      addCategory(newCatName);
      setNewCatName('');
    }
  };

  const handleUpdateContact = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    updateContactInfo({
      phone: fd.get('phone'),
      whatsapp: fd.get('whatsapp'),
      email: fd.get('email'),
      address: fd.get('address'),
      mapsUrl: fd.get('mapsUrl')
    });
    alert('Contact Info Updated!');
  };

  const handleAddSocial = (e) => {
    e.preventDefault();

    if (!socialForm.platform || !socialForm.url) {
      setSocialError('Please enter both platform and profile URL.');
      return;
    }

    if (!socialForm.qrBase64) {
      setSocialError('Please upload a QR code image so the URL can open directly when scanned.');
      return;
    }

    setSocialError('');
    if (editingSocialId) {
      updateSocialMedia(editingSocialId, socialForm);
    } else {
      addSocialMedia(socialForm);
    }
    setSocialForm({ platform: 'instagram', handle: '', url: '', color: '#D35400', qrBase64: '' });
    setIsAddingSocial(false);
    setEditingSocialId(null);
  };

  const openEditSocial = (sm) => {
    setSocialForm(sm);
    setEditingSocialId(sm.id);
    setIsAddingSocial(true);
  };

  const cancelSocialForm = () => {
    setIsAddingSocial(false);
    setEditingSocialId(null);
    setSocialForm({ platform: 'instagram', handle: '', url: '', color: '#D35400', qrBase64: '' });
  };

  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSocialForm(prev => ({ ...prev, qrBase64: reader.result }));
        setSocialError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const data = reader.result;
        // Persist logo via context
        setSiteLogo(data);
        alert('Logo updated successfully.');
      };
      reader.readAsDataURL(file);
    }
  };

  const resetLogoToDefault = () => {
    if (!window.confirm('Reset logo to default?')) return;
    setSiteLogo('/logo.png');
    alert('Logo reset to default.');
  };

  const downloadCurrentLogo = async () => {
    try {
      const url = siteLogo;
      if (!url) { alert('No logo available to download.'); return; }
      if (url.startsWith('data:')) {
        // data URL -> download directly
        const a = document.createElement('a');
        a.href = url;
        a.download = 'site-logo.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
      // Otherwise fetch and download
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'site-logo.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      alert('Failed to download logo. Check the console for details.');
    }
  };

  // ── Export / Import site data (for publishing local admin edits) ───────
  const handleExportData = () => {
    try {
      const payload = {
        products,
        categories,
        contactInfo,
        banners,
        bannerSettings,
        siteLogo
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sirihomefoods-data.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export data. Check the console for details.');
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.products) localStorage.setItem('shf_products', JSON.stringify(data.products));
        if (data.categories) localStorage.setItem('shf_categories', JSON.stringify(data.categories));
        if (data.contactInfo) localStorage.setItem('shf_contact', JSON.stringify(data.contactInfo));
        if (data.banners) localStorage.setItem('shf_banners', JSON.stringify(data.banners));
        if (data.bannerSettings) localStorage.setItem('shf_banner_settings', JSON.stringify(data.bannerSettings));
        if (data.siteLogo) localStorage.setItem('shf_site_logo', JSON.stringify(data.siteLogo));
        alert('Imported data saved to localStorage. The app will reload to apply changes.');
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('Invalid JSON file. Import failed.');
      }
    };
    reader.readAsText(file);
    // reset input so same file can be re-selected if needed
    e.target.value = '';
  };

  const publishToServer = async () => {
    if (!window.confirm('Publish current admin data to server (this will update the live site data)?')) return;
    try {
      await publishSiteData();
      alert('Published successfully. The main website updates automatically.');
    } catch (err) {
      console.error(err);
      alert('Publish failed. Please check your Firebase connection and try again.');
    }
  };

  const handleProductImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // ── Banner Handlers ────────────────────────────────────────────────────────
  const handleBannerSubmit = (e) => {
    e.preventDefault();
    if (editingBannerId) updateBanner(editingBannerId, bannerForm);
    else addBanner(bannerForm);
    
    setBannerForm({ title: '', subtitle: '', image: '' });
    setIsAddingBanner(false);
    setEditingBannerId(null);
  };

  const openEditBanner = (b) => {
    setBannerForm(b);
    setEditingBannerId(b.id);
    setIsAddingBanner(true);
  };

  const handleBannerImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBannerForm(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalProducts  = products.length;
  const lowStockCount  = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalStockValue = products.reduce((a, p) => {
    const basePrice = p.variants?.find(v => v.weight === '1kg')?.price || p.price || 0;
    return a + (basePrice * p.stock);
  }, 0);

  // ─────────────────────────────────────────────────────────────────────────
  // LOGIN SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="admin-login-bg fade-in">
          <div className="login-card">
            <img src={siteLogo || '/logo.png'} alt="Siri Home Foods" className="login-logo" onError={(e)=>e.target.src='/logo.png'} />
          <h2>Admin Portal</h2>
          <p className="login-sub">Siri Home Foods — Inventory & Operations</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="pw-input-wrap">
              <Lock size={18} className="pw-icon" />
              <input
                type={showLoginPw ? 'text' : 'password'}
                placeholder="Admin Password"
                value={loginPw}
                onChange={e => setLoginPw(e.target.value)}
                required
              />
              <button type="button" className="eye-btn" onClick={() => setShowLoginPw(v => !v)}>
                {showLoginPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {loginError && <p className="login-error">{loginError}</p>}
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Login</button>
          </form>

          <div style={{ marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <p style={{ fontSize: '0.82rem', color: '#aaa', marginBottom: '10px' }}>Forgot your password?</p>
            <button
              onClick={() => setForgotPasswordMode(v => !v)}
              style={{
                background: 'none', border: '1px solid #ddd', borderRadius: '8px',
                padding: '8px 16px', fontSize: '0.85rem', color: '#888',
                cursor: 'pointer', width: '100%', transition: '0.2s'
              }}
              onMouseOver={e => e.target.style.borderColor = 'var(--primary)'}
              onMouseOut={e => e.target.style.borderColor = '#ddd'}
            >
              🔑 Reset password using your registered mobile number
            </button>
            {forgotPasswordMode && (
              <form onSubmit={handleForgotPasswordReset} style={{ marginTop: '18px', display: 'grid', gap: '12px' }}>
                <input
                  type="tel"
                  placeholder="Registered mobile number"
                  value={forgotPhone}
                  onChange={e => setForgotPhone(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                  required
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={forgotNewPw}
                  onChange={e => setForgotNewPw(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                  minLength={8}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={forgotConfirm}
                  onChange={e => setForgotConfirm(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                  minLength={8}
                  required
                />
                {forgotMsg.text && (
                  <p style={{ color: forgotMsg.type === 'error' ? '#c0392b' : '#27ae60', marginBottom: '0', fontSize: '0.9rem' }}>
                    {forgotMsg.text}
                  </p>
                )}
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  Reset Password
                </button>
              </form>
            )}
          </div>

          <Link to="/" className="back-link" style={{ justifyContent: 'center', marginTop: '15px' }}>
            <ArrowLeft size={16} /> Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="admin-full-layout fade-in">
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src={siteLogo || '/logo.png'} alt="Siri Home Foods" onError={(e)=>e.target.src='/logo.png'} />
          <span>Siri Admin</span>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'overview',   icon: <BarChart2 size={20} />,  label: 'Overview' },
            { id: 'inventory',  icon: <Package size={20} />,    label: 'Inventory' },
            { id: 'banners',    icon: <Monitor size={20} />,    label: 'Banners' },
            { id: 'categories', icon: <Tag size={20} />,        label: 'Categories' },
            { id: 'contact',    icon: <Globe size={20} />,      label: 'Contact Info' },
            { id: 'orders',     icon: <ShoppingBag size={20} />,label: 'Orders Info' },
            { id: 'password',   icon: <Key size={20} />,         label: 'Reset Password' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`sidebar-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px' }}>
          <button className="btn" onClick={publishToServer} style={{ width: '100%', marginBottom: '8px', background: '#2d9cdb', color: '#fff' }}>Publish To Server</button>
          <button className="btn" onClick={handleExportData} style={{ width: '100%', marginBottom: '8px' }}>Export Site Data</button>
          <label className="btn" style={{ display: 'block', width: '100%', textAlign: 'center', cursor: 'pointer' }}>
            Import Site Data
            <input type="file" accept="application/json" onChange={handleImportFile} style={{ display: 'none' }} />
          </label>
        </div>

        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="admin-main">

        {/* ── OVERVIEW TAB ──────────────────────────────────────────────── */}
        {activeTab === 'overview' && (() => {
          const categoryCounts = categories.reduce((acc, cat) => {
            acc[cat] = products.filter(p => p.category === cat).length;
            return acc;
          }, {});
          const maxProducts = Math.max(...Object.values(categoryCounts), 1);

          return (
            <div className="tab-content fade-in">
              <h2 className="tab-title">Dashboard Overview</h2>

              <div className="metric-grid">
                <div className="metric-tile">
                  <div className="metric-icon terracotta"><Package size={28} /></div>
                  <div className="metric-info">
                    <h4>Total Products</h4>
                    <div className="val">{totalProducts}</div>
                  </div>
                </div>
                <div className="metric-tile">
                  <div className="metric-icon green"><TrendingUp size={28} /></div>
                  <div className="metric-info">
                    <h4>Stock Value</h4>
                    <div className="val">₹{totalStockValue.toLocaleString()}</div>
                  </div>
                </div>
                <div className="metric-tile">
                  <div className="metric-icon gold"><AlertTriangle size={28} /></div>
                  <div className="metric-info">
                    <h4>Low Stock</h4>
                    <div className="val">{lowStockCount}</div>
                  </div>
                </div>
                <div className="metric-tile">
                  <div className="metric-icon red"><ShoppingBag size={28} /></div>
                  <div className="metric-info">
                    <h4>Out of Stock</h4>
                    <div className="val">{outOfStockCount}</div>
                  </div>
                </div>
              </div>

              <div className="dashboard-section">
                <h3 className="section-title">🚀 Quick Actions</h3>
                <div className="quick-actions">
                  <div className="action-card" onClick={() => { setActiveTab('inventory'); setIsAdding(true); }}>
                    <Plus size={24} />
                    <span>Add Product</span>
                  </div>
                  <div className="action-card" onClick={() => setActiveTab('banners')}>
                    <Monitor size={24} />
                    <span>Edit Banners</span>
                  </div>
                  <div className="action-card" onClick={() => setActiveTab('categories')}>
                    <Tag size={24} />
                    <span>Categories</span>
                  </div>
                  <div className="action-card" onClick={() => setActiveTab('contact')}>
                    <Globe size={24} />
                    <span>Contact Info</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-section">
                <h3 className="section-title">📊 Category Distribution</h3>
                <div className="category-bars">
                  {categories.map(cat => (
                    <div key={cat} className="cat-progress-item">
                      <div className="cat-progress-label">
                        <span className="capitalize">{cat}</span>
                        <span>{categoryCounts[cat] || 0} Products</span>
                      </div>
                      <div className="cat-progress-bg">
                        <div 
                          className="cat-progress-fill" 
                          style={{ width: `${((categoryCounts[cat] || 0) / maxProducts) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low stock warnings */}
              {(lowStockCount > 0 || outOfStockCount > 0) && (
                <div className="dashboard-section" style={{ borderLeft: '4px solid #e74c3c' }}>
                  <h3 className="section-title" style={{ color: '#e74c3c' }}>
                    <AlertTriangle size={22} /> Critical Stock Alerts
                  </h3>
                  <ul style={{ marginTop: '8px', paddingLeft: '18px' }}>
                    {products.filter(p => p.stock === 0).map(p => (
                      <li key={p.id} style={{ color: '#E74C3C', fontWeight: '600', marginBottom: '8px' }}>
                        {p.name} — OUT OF STOCK
                      </li>
                    ))}
                    {products.filter(p => p.stock > 0 && p.stock <= 5).map(p => (
                      <li key={p.id} style={{ color: '#E67E22', fontWeight: '500', marginBottom: '8px' }}>
                        {p.name} — Only {p.stock} units left
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── INVENTORY TAB ─────────────────────────────────────────────── */}
        {activeTab === 'inventory' && (
          <div className="tab-content fade-in">
            <div className="tab-header">
              <h2 className="tab-title">Inventory Management</h2>
              <button className="btn-primary btn-sm" onClick={openAddForm}>
                <Plus size={16} /> Add Product
              </button>
            </div>

            {/* Product Form */}
            {(isAdding || editingId) && (
              <div className="add-product-card slide-up">
                <div className="form-card-header">
                  <h3>{isAdding ? '➕ Add New Product' : `✏️ Edit: ${formData.name}`}</h3>
                  <button onClick={closeForm} className="close-btn"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="add-form">
                  <div className="form-row">
                    <div className="field-group">
                      <label>Product Name *</label>
                      <input type="text" placeholder="e.g. Tomato Pickle" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="field-group">
                      <label>Category *</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        {categories.map(c => (
                          <option key={c} value={c}>{getCategoryLabel(c)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="checkbox-group">
                      <input 
                        type="checkbox" 
                        id="hasVariants" 
                        checked={formData.hasVariants} 
                        onChange={e => setFormData({...formData, hasVariants: e.target.checked})} 
                      />
                      <label htmlFor="hasVariants">Enable Weight Variants (250g, 500g, 1kg)</label>
                    </div>
                  </div>
                  <div className="form-row">
                    {formData.hasVariants ? (
                      <>
                        <div className="field-group">
                          <label>250g Price (₹)</label>
                          <input type="number" placeholder="Auto-calc if blank" value={formData.price250} onChange={e => setFormData({...formData, price250: e.target.value})} />
                        </div>
                        <div className="field-group">
                          <label>500g Price (₹)</label>
                          <input type="number" placeholder="Auto-calc if blank" value={formData.price500} onChange={e => setFormData({...formData, price500: e.target.value})} />
                        </div>
                        <div className="field-group">
                          <label>1kg Price (₹) *</label>
                          <input type="number" placeholder="e.g. 450" value={formData.price1kg} onChange={e => setFormData({...formData, price1kg: e.target.value})} />
                        </div>
                      </>
                    ) : (
                      <div className="field-group">
                        <label>Product Price (₹) *</label>
                        <input type="number" placeholder="e.g. 20" value={formData.price1kg} onChange={e => setFormData({...formData, price1kg: e.target.value})} />
                      </div>
                    )}
                  </div>
                  <div className="form-row">
                    <div className="field-group">
                      <label>Stock Available *</label>
                      <input type="number" placeholder="e.g. 20" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field-group">
                      <label>Product Image Upload</label>
                      <input type="file" accept="image/*" onChange={handleProductImageUpload} />
                    </div>
                    <div className="field-group">
                      <label>Or Image URL <span style={{fontWeight:400,color:'#999'}}>(leave blank for default)</span></label>
                      <input type="text" placeholder="https://... or /images/..." value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                    </div>
                  </div>
                  {formData.image && formData.image.length > 0 && (
                    <div className="form-row">
                      <div className="field-group full-width" style={{ alignItems: 'flex-start' }}>
                        <p style={{ fontSize: '0.82rem', color: '#888', marginBottom: '5px' }}>Image Preview:</p>
                        <img src={formData.image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} onLoad={(e) => e.target.style.display = 'block'} />
                      </div>
                    </div>
                  )}
                  <div className="form-row">
                    <div className="field-group full-width">
                      <label>Description</label>
                      <textarea placeholder="Brief product description…" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} rows="2"></textarea>
                    </div>
                  </div>
                  <button type="submit" className="btn-success" style={{marginTop:'10px'}}>
                    <Check size={18} /> {isAdding ? 'Save Product' : 'Update Product'}
                  </button>
                </form>
              </div>
            )}

            {/* Table */}
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price / kg</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className={p.stock === 0 ? 'stock-out-row' : p.stock <= 5 ? 'stock-warning' : ''}>
                      <td><img src={p.image} alt={p.name} className="table-img" onError={e => e.target.src='https://via.placeholder.com/50'} /></td>
                      <td className="fw-600">{p.name}</td>
                      <td className="capitalize">{p.category}</td>
                      <td>₹{p.variants?.find(v=>v.weight==='1kg')?.price || p.price}</td>
                      <td style={{fontWeight:'bold'}}>{p.stock}</td>
                      <td>
                        {p.stock === 0
                          ? <span className="badge stock-out">Out of Stock</span>
                          : p.stock <= 5
                          ? <span className="badge stock-low">Low Stock</span>
                          : <span className="badge stock-ok">In Stock</span>}
                      </td>
                      <td>
                        <div style={{display:'flex', gap:'8px'}}>
                          <button className="btn-icon edit-icon" onClick={() => openEditForm(p)} title="Edit"><Edit3 size={18} /></button>
                          <button className="btn-icon delete" onClick={() => { if(window.confirm('Delete this item?')) deleteProduct(p.id) }} title="Delete"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan="7" style={{textAlign:'center', padding:'30px', color:'#999'}}>No products yet. Add some!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BANNERS TAB ─────────────────────────────────────────────── */}
        {activeTab === 'banners' && (
          <div className="tab-content fade-in">
            <div className="tab-header">
              <h2 className="tab-title">Banner Management</h2>
              <button className="btn-primary btn-sm" onClick={() => { setEditingBannerId(null); setBannerForm({ title: '', subtitle: '', image: '' }); setIsAddingBanner(true); }}>
                <Plus size={16} /> Add Banner
              </button>
            </div>

            <div className="add-product-card" style={{ marginBottom: '20px' }}>
               <h3>Banner Settings</h3>
               <div className="form-row">
                 <div className="field-group">
                   <label>Rotation Speed (milliseconds)</label>
                   <input 
                     type="number" 
                     value={bannerSettings.speed} 
                     onChange={e => updateBannerSettings({ speed: Number(e.target.value) })} 
                     placeholder="e.g. 5000"
                   />
                   <span style={{ fontSize: '0.8rem', color: '#888' }}>5000ms = 5 seconds</span>
                 </div>
               </div>
            </div>

            {isAddingBanner && (
              <div className="add-product-card slide-up" style={{ marginBottom: '20px' }}>
                <div className="form-card-header">
                  <h3>{editingBannerId ? '✏️ Edit Banner' : '➕ Add New Banner'}</h3>
                  <button onClick={() => setIsAddingBanner(false)} className="close-btn"><X size={20} /></button>
                </div>
                <form onSubmit={handleBannerSubmit} className="add-form">
                  <div className="form-row">
                    <div className="field-group">
                      <label>Banner Title</label>
                      <input type="text" value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field-group">
                      <label>Banner Subtitle</label>
                      <input type="text" value={bannerForm.subtitle} onChange={e => setBannerForm({...bannerForm, subtitle: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field-group">
                      <label>Upload Image</label>
                      <input type="file" accept="image/*" onChange={handleBannerImageUpload} />
                    </div>
                  </div>
                  {bannerForm.image && (
                    <div className="form-row">
                      <img src={bannerForm.image} alt="Preview" style={{ height: '100px', borderRadius: '8px' }} />
                    </div>
                  )}
                  <button type="submit" className="btn-success">
                    <Check size={18} /> {editingBannerId ? 'Update Banner' : 'Save Banner'}
                  </button>
                </form>
              </div>
            )}

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Preview</th>
                    <th>Title</th>
                    <th>Subtitle</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map(b => (
                    <tr key={b.id}>
                      <td><img src={b.image} alt="" style={{ height: '40px', borderRadius: '4px' }} /></td>
                      <td className="fw-600">{b.title}</td>
                      <td style={{ fontSize: '0.9rem', color: '#666' }}>{b.subtitle}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-icon edit-icon" onClick={() => openEditBanner(b)} title="Edit"><Edit3 size={18} /></button>
                          <button className="btn-icon delete" onClick={() => { if(window.confirm('Delete this banner?')) deleteBanner(b.id) }} title="Delete"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {banners.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No banners added yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CATEGORIES TAB ─────────────────────────────────────────────── */}
        {activeTab === 'categories' && (
          <div className="tab-content fade-in">
            <h2 className="tab-title">Manage Categories</h2>
            <div className="language-picker" style={{ marginBottom: '18px', gap: '10px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>Show category names in:</span>
              <button type="button" className={language === 'english' ? 'lang-btn active' : 'lang-btn'} onClick={() => setLanguage('english')}>
                English
              </button>
              <button type="button" className={language === 'telugu' ? 'lang-btn active' : 'lang-btn'} onClick={() => setLanguage('telugu')}>
                తెలుగు
              </button>
            </div>
            <div className="add-product-card" style={{maxWidth:'500px', marginBottom:'20px'}}>
              <form onSubmit={handleAddCategory} className="add-form" style={{display:'flex', gap:'10px'}}>
                <input 
                  type="text" 
                  placeholder="New Category Name..." 
                  value={newCatName} 
                  onChange={e => setNewCatName(e.target.value)} 
                  style={{flex:1, padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}}
                />
                <button type="submit" className="btn-primary" style={{width:'auto', padding:'10px 20px'}}>Add</button>
              </form>
            </div>

            <div className="table-container" style={{maxWidth:'500px'}}>
              <table className="admin-table">
                <thead><tr><th>Category</th><th>Actions</th></tr></thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c}>
                      <td className="capitalize">
                        {getCategoryLabel(c)}
                        <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '4px' }}>{c}</div>
                      </td>
                      <td>
                        <button className="btn-icon delete" onClick={() => deleteCategory(c)} title="Delete"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CONTACT INFO TAB ───────────────────────────────────────────── */}
        {activeTab === 'contact' && (
          <div className="tab-content fade-in">
            <h2 className="tab-title">Contact & Social Media</h2>
            
            <div className="add-product-card" style={{marginBottom:'30px'}}>
              <h3>General Contact Info</h3>
              <form onSubmit={handleUpdateContact} className="add-form">
                <div className="form-row">
                  <div className="field-group">
                    <label>Phone Number</label>
                    <input type="text" name="phone" defaultValue={contactInfo.phone} placeholder="+91 98..." />
                  </div>
                  <div className="field-group">
                    <label>WhatsApp Number</label>
                    <input type="text" name="whatsapp" defaultValue={contactInfo.whatsapp} placeholder="9198..." />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field-group">
                    <label>Email Address</label>
                    <input type="email" name="email" defaultValue={contactInfo.email} placeholder="contact@..." />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field-group full-width">
                    <label>Physical Address</label>
                    <textarea name="address" defaultValue={contactInfo.address} rows="2"></textarea>
                  </div>
                </div>
                <div className="form-row">
                  <div className="field-group full-width">
                    <label>Google Maps Embed URL</label>
                    <input type="text" name="mapsUrl" defaultValue={contactInfo.mapsUrl} />
                  </div>
                </div>
                <button type="submit" className="btn-success" style={{width:'auto', alignSelf:'flex-start', marginTop:'10px'}}><Check size={18}/> Save Contact Info</button>
              </form>
            </div>

            <div className="add-product-card" style={{ marginTop: '18px' }}>
              <h3>Site Logo</h3>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Upload a logo image to replace the site header logo. The file will be stored in localStorage (data URL) and used across the site.</p>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '12px' }}>
                <div style={{ width: '110px', height: '70px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <img src={siteLogo || '/logo.png'} alt="Current logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e)=>e.target.src='/logo.png'} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} />
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className="btn-primary" type="button" onClick={downloadCurrentLogo}>Download Logo</button>
                    <button className="btn-clear" type="button" onClick={resetLogoToDefault}>Reset to Default</button>
                  </div>
                  <div style={{ color: '#888', fontSize: '0.9rem' }}>Or set logo URL manually in the console with <code>localStorage.setItem('shf_site_logo', JSON.stringify('https://...'))</code></div>
                </div>
              </div>
            </div>

            <div className="add-product-card">
              <div className="form-card-header">
                <h3>Social Media Links & QR</h3>
                {!isAddingSocial && <button className="btn-primary btn-sm" onClick={() => setIsAddingSocial(true)}><Plus size={16}/> Add Social</button>}
              </div>

              {isAddingSocial && (
                <form onSubmit={handleAddSocial} className="add-form" style={{marginBottom:'20px', paddingBottom:'20px', borderBottom:'1px solid #eee'}}>
                  <div className="form-row">
                    <div className="field-group">
                      <label>Platform</label>
                      <select value={socialForm.platform} onChange={e => setSocialForm({...socialForm, platform: e.target.value})}>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="youtube">YouTube</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="twitter">Twitter</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="field-group">
                      <label>Handle / Name</label>
                      <input type="text" placeholder="@username" value={socialForm.handle} onChange={e => setSocialForm({...socialForm, handle: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field-group full-width">
                      <label>Profile URL</label>
                      <input type="text" placeholder="https://..." value={socialForm.url} onChange={e => setSocialForm({...socialForm, url: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field-group">
                      <label>Theme Color</label>
                      <input type="color" value={socialForm.color} onChange={e => setSocialForm({...socialForm, color: e.target.value})} style={{height:'40px', padding:'2px'}} />
                    </div>
                    <div className="field-group">
                      <label>QR Code Image (Upload)</label>
                      <input type="file" accept="image/*" onChange={handleQRUpload} />
                      <p style={{ marginTop: '6px', color: '#666', fontSize: '0.85rem' }}>
                        Upload the QR image for the same URL so scanning sends customers directly to the link.
                      </p>
                    </div>
                  </div>
                  {socialError && (
                    <div style={{ color: '#d64545', marginBottom: '12px', fontWeight: 600 }}>
                      {socialError}
                    </div>
                  )}
                  <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                    <button type="submit" className="btn-success" style={{width:'auto'}}>
                      <Check size={18}/> {editingSocialId ? 'Update Social Link' : 'Save Social Link'}
                    </button>
                    <button type="button" className="btn-icon" onClick={cancelSocialForm} style={{border:'1px solid #ccc'}}>Cancel</button>
                  </div>
                </form>
              )}

              <div className="table-container">
                <table className="admin-table">
                  <thead><tr><th>Platform</th><th>Handle</th><th>URL</th><th>QR</th><th>Actions</th></tr></thead>
                  <tbody>
                    {contactInfo.socialMedia?.map(sm => (
                      <tr key={sm.id}>
                        <td className="capitalize">{sm.platform}</td>
                        <td>{sm.handle}</td>
                        <td><a href={sm.url} target="_blank" rel="noreferrer">Link</a></td>
                        <td>{sm.qrBase64 ? 'Yes' : 'No'}</td>
                        <td>
                          <div style={{display:'flex', gap:'8px'}}>
                            <button className="btn-icon edit-icon" onClick={() => openEditSocial(sm)} title="Edit"><Edit3 size={18} /></button>
                            <button className="btn-icon delete" onClick={() => deleteSocialMedia(sm.id)} title="Delete"><Trash2 size={18}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!contactInfo.socialMedia || contactInfo.socialMedia.length === 0) && (
                      <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>No social links added yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS INFO TAB ────────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="tab-content fade-in">
            <h2 className="tab-title">Orders & Payments</h2>
            <div className="info-card">
              <h3>💳 Payment Integration — Razorpay</h3>
              <p style={{marginTop:'10px', color:'#555', lineHeight:'1.8'}}>
                This site uses <strong>Razorpay</strong> for secure online payments. When a customer places an order, they are directed to the Razorpay payment gateway which handles:
              </p>
              <ul style={{marginTop:'12px', paddingLeft:'20px', color:'#555', lineHeight:'2'}}>
                <li>UPI (PhonePe, Google Pay, Paytm)</li>
                <li>Debit &amp; Credit Cards</li>
                <li>Net Banking</li>
                <li>EMI options</li>
              </ul>
              <div className="info-highlight" style={{marginTop:'20px'}}>
                <strong>⚠️ To activate live payments:</strong>
                <ol style={{marginTop:'10px', paddingLeft:'20px', lineHeight:'2', color:'#555'}}>
                  <li>Create a free account at <a href="https://razorpay.com" target="_blank" rel="noreferrer" style={{color:'var(--primary)'}}>razorpay.com</a></li>
                  <li>Get your <strong>Key ID</strong> from Settings → API Keys</li>
                  <li>Replace <code>YOUR_RAZORPAY_KEY</code> in <code>Shop.jsx</code> with your actual Key ID</li>
                  <li>Test in Test Mode first — Razorpay provides test card numbers</li>
                </ol>
              </div>

              <div style={{marginTop:'20px', padding:'15px', background:'#f8f9fa', borderRadius:'10px'}}>
                <strong>Current WhatsApp Order Flow:</strong>
                <p style={{marginTop:'8px', color:'#666', fontSize:'0.9rem'}}>Orders currently go via WhatsApp message to <strong>+91 99121 42247</strong>. After confirming, you can collect payment via UPI.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── PASSWORD RESET TAB ─────────────────────────────────────────── */}
        {activeTab === 'password' && (
          <div className="tab-content fade-in">
            <h2 className="tab-title">Reset Admin Password</h2>
            <div className="add-product-card" style={{maxWidth:'480px'}}>
              <h3><Key size={20} style={{marginRight:'8px', verticalAlign:'middle'}} />Change Password</h3>
              <p style={{color:'#777', fontSize:'0.9rem', margin:'10px 0 20px'}}>
                Your password is securely hashed (SHA-256) before saving — the plain text is never stored.
                Minimum 8 characters required.
              </p>

              <form onSubmit={handlePasswordReset} className="add-form">
                {[
                  { key: 'current', label: 'Current Password',  placeholder: 'Enter current password' },
                  { key: 'newPw',   label: 'New Password',       placeholder: 'Min. 8 characters' },
                  { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                ].map(f => (
                  <div className="field-group" key={f.key} style={{marginBottom:'15px'}}>
                    <label>{f.label}</label>
                    <div className="pw-input-wrap">
                      <Lock size={16} className="pw-icon" />
                      <input
                        type={showPwForm[f.key] ? 'text' : 'password'}
                        placeholder={f.placeholder}
                        value={pwForm[f.key]}
                        onChange={e => setPwForm({...pwForm, [f.key]: e.target.value})}
                        required
                      />
                      <button type="button" className="eye-btn" onClick={() => setShowPwForm(v => ({...v, [f.key]: !v[f.key]}))}>
                        {showPwForm[f.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}

                {pwMsg.text && (
                  <p className={pwMsg.type === 'success' ? 'pw-success' : 'login-error'} style={{marginBottom:'12px'}}>
                    {pwMsg.type === 'success' ? <Check size={16} style={{marginRight:'5px'}} /> : null}
                    {pwMsg.text}
                  </p>
                )}

                <button type="submit" className="btn-primary" style={{width:'100%'}}>
                  <Key size={18} /> Update Password
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
