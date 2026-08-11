import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Shop from './pages/Shop';
import About from './pages/About';
import Faq from './pages/Faq';
import Cart from './pages/Cart';
import AdminDashboard from './pages/AdminDashboard';
import ContactUs from './pages/ContactUs';
import OrderHistory from './pages/OrderHistory';
import TopBar from './components/TopBar';
import './index.css';

function App() {
  return (
    <StoreProvider>
      <Router>
        <TopBar />
        <Routes>
          <Route path="/"          element={<Shop />} />
          <Route path="/about"     element={<About />} />
          <Route path="/faq"       element={<Faq />} />
          <Route path="/cart"      element={<Cart />} />
          <Route path="/contact"   element={<ContactUs />} />
          <Route path="/orders"    element={<OrderHistory />} />
          <Route path="/admin"     element={<AdminDashboard />} />
        </Routes>
      </Router>
    </StoreProvider>
  );
}

export default App;
