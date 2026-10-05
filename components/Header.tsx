'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import { StoreStatusBadge } from './StoreStatus';
import { useCart } from '@/context/CartContext';

export const Header: React.FC = () => {
  const { items, openCart, pricingSummary } = useCart();
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full glass-nav shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Official DeliPizza PNG Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group transition-transform active:scale-95"
          aria-label={siteConfig.brand.name}
        >
          <img
            src="/brand/delipizza-logo.png"
            alt={siteConfig.brand.name}
            className="h-9 sm:h-12 w-auto object-contain max-w-[160px] sm:max-w-[220px]"
          />
        </Link>

        {/* Store Status & Cart Action */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:block">
            <StoreStatusBadge />
          </div>

          {/* Cart Trigger */}
          <button
            onClick={openCart}
            className="relative flex items-center gap-2 bg-gradient-to-r from-brand-primary to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-sm shadow-glow transition-all active:scale-95"
            aria-label={`Ver carrito de compras con ${totalCount} productos`}
            id="cart-header-button"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden xs:inline">Carrito</span>
            {totalCount > 0 && (
              <span className="bg-amber-400 text-neutral-950 font-black text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center shadow">
                {totalCount}
              </span>
            )}
            {pricingSummary.subtotalCOP > 0 && (
              <span className="hidden md:inline font-mono text-xs pl-1 border-l border-red-400/40 text-red-100">
                ${pricingSummary.subtotalCOP.toLocaleString('es-CO')}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
