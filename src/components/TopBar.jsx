import React from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';

const TopBar = () => {
  const { cart, contactInfo } = useContext(StoreContext);

  return (
    <div className="site-topbar">
      <div className="site-topbar-inner">
        <div className="topbar-left">
          {contactInfo.phone && <a href={`tel:${contactInfo.phone}`} className="topbar-pill">📞 Contact Us</a>}
        </div>

        <div className="topbar-center">
          <Link to="/orders" className="admin-link">📦 Track Orders</Link>
          <Link to="/admin" className="admin-link">⚙️ Admin Portal</Link>
        </div>

        <div className="topbar-right">
          <Link to="/cart" className="cart-link small">
            🛒 <span>My Cart</span>
            <span className="cart-count">{cart.length}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
