'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Pizza } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import { StoreStatusBadge } from './StoreStatus';
import { useCart } from '@/context/CartContext';

export const Header: React.FC = () => {
  const { items, openCart, pricingSummary } = useCart();
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full glass-nav shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
          aria-label={siteConfig.brand.name}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-brand-primary to-amber-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
            <Pizza className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-white block leading-none">
              {siteConfig.brand.name}
            </span>
            <span className="text-[11px] sm:text-xs text-amber-400 font-medium hidden xs:block mt-0.5">
              {siteConfig.brand.tagline}
            </span>
          </div>
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
