import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { ArrowLeft, Package, CheckCircle, Clock, Truck, Home } from 'lucide-react';

const OrderHistory = () => {
  const { orders, getOrderHistory } = useContext(StoreContext);
  const [filterPhone, setFilterPhone] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    const found = getOrderHistory(filterPhone);
    setFilteredOrders(found);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} className="text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle size={20} className="text-blue-500" />;
      case 'dispatched':
        return <Truck size={20} className="text-purple-500" />;
      case 'delivered':
        return <CheckCircle size={20} className="text-green-500" />;
      default:
        return <Package size={20} className="text-gray-500" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Order Received',
      confirmed: 'Confirmed',
      dispatched: 'On the way',
      delivered: 'Delivered'
    };
    return labels[status] || status;
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="order-history-page fade-in">
      <header className="page-hero order-hero">
        <div className="hero-copy">
          <Link to="/" className="hero-back-link"><ArrowLeft size={18} /> Back to Shop</Link>
          <span className="eyebrow">Track Orders</span>
          <h1>View your order history and track deliveries.</h1>
          <p>Enter your phone number to see all your orders.</p>
        </div>
      </header>

      <main className="order-history-main">
        <div className="search-section">
          <form onSubmit={handleSearch} className="order-search-form">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number (e.g., 9912142247)"
                value={filterPhone}
                onChange={(e) => setFilterPhone(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Search Orders</button>
          </form>
        </div>

        <div className="orders-section">
          {filteredOrders.length === 0 && filterPhone ? (
            <div className="empty-state">
              <Package size={48} />
              <h3>No orders found</h3>
              <p>No orders found for phone number: {filterPhone}</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="orders-list">
              <h2>Your Orders ({filteredOrders.length})</h2>
              {filteredOrders.map((order) => (
                <div key={order.id} className="order-card slide-up">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Order #{order.id.replace('order_', '').slice(-8)}</h3>
                      <p className="order-date">{formatDate(order.timestamp)}</p>
                    </div>
                    <div className="order-status">
                      {getStatusIcon(order.status)}
                      <span className={`status-label status-${order.status}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="order-details">
                    <div className="detail-group">
                      <strong>Customer:</strong> {order.customerName}
                    </div>
                    <div className="detail-group">
                      <strong>Phone:</strong> {order.phone}
                    </div>
                    <div className="detail-group">
                      <strong>Address:</strong> {order.address}
                    </div>
                    <div className="detail-group">
                      <strong>Payment:</strong> {order.paymentMethod === 'whatsapp' ? 'WhatsApp' : 'Online (Razorpay)'}
                    </div>
                  </div>

                  <div className="order-items">
                    <h4>Items</h4>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="item-row">
                        <span className="item-name">
                          {item.productName} ({item.variant?.weight})
                        </span>
                        <span className="item-qty">×{item.qty}</span>
                        <span className="item-price">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <strong>Total:</strong>
                      <span className="total-amount">₹{order.total}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="initial-state">
              <Package size={48} />
              <h3>Track Your Orders</h3>
              <p>Enter your phone number above to view order history and status.</p>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .order-history-page {
          min-height: 100vh;
          background: var(--bg-color);
        }

        .order-hero {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          padding: 60px 20px;
          text-align: center;
          color: white;
        }

        .order-hero h1 {
          color: white;
          margin: 16px 0 8px;
          font-size: 2.2rem;
        }

        .order-hero p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
        }

        .order-history-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .search-section {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 8px 24px rgba(255, 117, 0, 0.12);
          margin-bottom: 40px;
        }

        .order-search-form {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: flex-end;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 600;
          color: var(--text-main);
          font-size: 0.95rem;
        }

        .form-group input {
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .orders-section {
          margin-top: 40px;
        }

        .orders-list h2 {
          font-size: 1.5rem;
          margin-bottom: 20px;
          color: var(--text-main);
        }

        .order-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          border-left: 4px solid var(--primary);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .order-info h3 {
          margin: 0;
          color: var(--text-main);
          font-size: 1.1rem;
        }

        .order-date {
          color: var(--text-muted);
          font-size: 0.85rem;
          margin: 4px 0 0;
        }

        .order-status {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f5f5f5;
          padding: 8px 16px;
          border-radius: 20px;
        }

        .status-label {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .status-pending { color: #ffa500; }
        .status-confirmed { color: #2196f3; }
        .status-dispatched { color: #9c27b0; }
        .status-delivered { color: #4caf50; }

        .order-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 20px;
          padding: 16px;
          background: #fafafa;
          border-radius: 12px;
        }

        .detail-group {
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .detail-group strong {
          display: block;
          color: var(--text-muted);
          font-size: 0.8rem;
          margin-bottom: 4px;
        }

        .order-items {
          margin-bottom: 16px;
          padding: 16px;
          background: #fafafa;
          border-radius: 12px;
        }

        .order-items h4 {
          margin: 0 0 12px;
          font-size: 0.95rem;
          color: var(--text-main);
        }

        .item-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 12px;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e0e0e0;
          font-size: 0.9rem;
        }

        .item-row:last-child {
          border-bottom: none;
        }

        .item-name {
          color: var(--text-main);
          font-weight: 500;
        }

        .item-qty, .item-price {
          color: var(--text-muted);
          text-align: right;
        }

        .order-footer {
          border-top: 2px solid #f0f0f0;
          padding-top: 16px;
        }

        .order-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-amount {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--primary);
        }

        .empty-state, .initial-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-muted);
        }

        .empty-state svg, .initial-state svg {
          margin: 0 auto 16px;
          opacity: 0.3;
        }

        .empty-state h3, .initial-state h3 {
          font-size: 1.3rem;
          margin: 16px 0 8px;
          color: var(--text-main);
        }

        @media (max-width: 600px) {
          .order-search-form {
            grid-template-columns: 1fr;
          }

          .order-history-main {
            padding: 20px 16px;
          }

          .order-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .order-details {
            grid-template-columns: 1fr;
          }

          .order-card {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderHistory;
