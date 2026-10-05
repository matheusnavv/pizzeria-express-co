import { createRoot } from 'react-dom/client';
import { db } from './api/base44Client';
import { CartProvider } from './context/CartContext';
import { Routes, Route } from './preview-router';
import Home from './pages/Home';
import Checkout from './pages/Checkout';

globalThis.__B44_DB__ = db;

if (typeof window !== 'undefined' && !window.localStorage.getItem('lead_city')) {
  window.localStorage.setItem('lead_city', 'Bogotá');
}

createRoot(document.getElementById('root')).render(
  <CartProvider>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/checkout" element={<Checkout />} />
    </Routes>
  </CartProvider>
);
