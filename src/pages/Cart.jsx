import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { ArrowLeft, ShoppingBag, Phone, User, CreditCard, CheckCircle, Plus, Minus, Trash2 } from 'lucide-react';

const RAZORPAY_KEY_ID = 'YOUR_RAZORPAY_KEY_ID';

function loadRazorpayScript() {
  return new Promise(resolve => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const Cart = () => {
  const {
    cart, removeFromCart, clearCart, updateCartQty, processCheckout, siteLogo, saveOrder
  } = useContext(StoreContext);

  const [checkoutData, setCheckoutData] = useState({ name: '', phone: '', address: '' });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  const cartTotal = cart.reduce((acc, item) => {
    const price = item.selectedVariant ? item.selectedVariant.price : (item.price || 0);
    return acc + price * item.qty;
  }, 0);

  const validate = () => {
    if (!checkoutData.name || !checkoutData.phone || !checkoutData.address) {
      alert('Please fill all delivery details.');
      return false;
    }
    if (cart.length === 0) {
      alert('Your basket is empty.');
      return false;
    }
    return true;
  };

  const handleWhatsApp = () => {
    if (!validate()) return;
    const success = processCheckout();
    if (!success) {
      alert('Some items exceed available stock. Please review.');
      return;
    }

    // Save order to history
    saveOrder({ ...checkoutData, paymentMethod: 'whatsapp' });

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

    setTimeout(() => {
      setOrderPlaced(false);
      setCheckoutData({ name: '', phone: '', address: '' });
    }, 4000);
  };

  const handleRazorpay = async () => {
    if (!validate()) return;

    if (RAZORPAY_KEY_ID === 'YOUR_RAZORPAY_KEY_ID') {
      alert('⚠️ Razorpay Key not set. Please add your Razorpay Key ID in src/pages/Cart.jsx to enable online payments.');
      return;
    }

    setPayLoading(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Failed to load payment gateway. Check your internet connection.');
      setPayLoading(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: cartTotal * 100,
      currency: 'INR',
      name: 'Siri Home Foods',
      description: 'Homemade order checkout',
      image: siteLogo || '/logo.png',
      prefill: { name: checkoutData.name, contact: checkoutData.phone },
      notes: { address: checkoutData.address },
      theme: { color: '#D35400' },
      handler: function(response) {
        const success = processCheckout();
        if (success) {
          saveOrder({ ...checkoutData, paymentMethod: 'razorpay', paymentId: response.razorpay_payment_id });
          setOrderPlaced(true);
          alert(`✅ Payment Successful!\nPayment ID: ${response.razorpay_payment_id}\n\nThank you, ${checkoutData.name}!`);
          setTimeout(() => {
            setOrderPlaced(false);
            setCheckoutData({ name: '', phone: '', address: '' });
          }, 5000);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => alert('❌ Payment failed. Please try again.'));
    rzp.open();
    setPayLoading(false);
  };

  return (
    <div className="cart-page fade-in">
      <header className="page-hero cart-hero">
        <div className="hero-copy">
          <Link to="/" className="hero-back-link"><ArrowLeft size={18} /> Back to Shop</Link>
          <span className="eyebrow">Your Cart</span>
          <h1>Review items and complete your order.</h1>
          <p>Manage quantities, remove items, and choose WhatsApp or online payment checkout.</p>
        </div>
      </header>

      <main className="cart-main-grid">
        <section className="cart-items-panel">
          <div className="cart-panel-header">
            <h2>Basket</h2>
            {cart.length > 0 && (
              <button className="btn-clear" onClick={clearCart}>Empty Basket</button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="empty-state">
              <p>Your cart is empty.</p>
              <Link to="/" className="btn-primary">Browse Products</Link>
            </div>
          ) : (
            <div className="cart-item-list">
              {cart.map(item => {
                const price = item.selectedVariant ? item.selectedVariant.price : (item.price || 0);
                const weight = item.selectedVariant ? item.selectedVariant.weight : '1kg';
                return (
                  <div key={item.cartKey} className="cart-item-card slide-up">
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <strong>{item.displayName || item.name}</strong>
                      <span>{weight}</span>
                      <span>₹{price} each</span>
                      <div className="cart-qty-controls">
                        <button onClick={() => updateCartQty(item.cartKey, item.qty - 1)}><Minus size={16} /></button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateCartQty(item.cartKey, item.qty + 1)}><Plus size={16} /></button>
                      </div>
                    </div>
                    <div className="item-right">
                      <span className="item-total">₹{price * item.qty}</span>
                      <button className="remove-btn" onClick={() => removeFromCart(item.cartKey)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="cart-summary-panel slide-left">
          <div className="summary-box">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Items</span>
              <span>{cart.length}</span>
            </div>
            <div className="summary-row">
              <span>Total</span>
              <strong>₹{cartTotal}</strong>
            </div>
          </div>

          <div className="checkout-form">
            <h3>Delivery Details</h3>
            <div className="input-group">
              <User size={18} />
              <input type="text" placeholder="Full Name" value={checkoutData.name} onChange={e => setCheckoutData({ ...checkoutData, name: e.target.value })} />
            </div>
            <div className="input-group">
              <Phone size={18} />
              <input type="tel" placeholder="WhatsApp Number" value={checkoutData.phone} onChange={e => setCheckoutData({ ...checkoutData, phone: e.target.value })} />
            </div>
            <div className="input-group align-start">
              <Phone size={18} style={{ marginTop: '14px' }} />
              <textarea rows="3" placeholder="Delivery Address" value={checkoutData.address} onChange={e => setCheckoutData({ ...checkoutData, address: e.target.value })} />
            </div>

            {orderPlaced ? (
              <button className="btn-success" disabled>
                <CheckCircle size={18} /> Order Confirmed
              </button>
            ) : (
              <>
                <button className="btn-primary" onClick={handleWhatsApp} disabled={cart.length === 0}>
                  <ShoppingBag size={18} /> Order via WhatsApp
                </button>
                <button className="btn-secondary" onClick={handleRazorpay} disabled={payLoading || cart.length === 0}>
                  <CreditCard size={18} /> {payLoading ? 'Loading…' : 'Pay Online'}
                </button>
              </>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Cart;
