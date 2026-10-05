'use client';

import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCOP } from '@/catalog/pricing';

interface StickyCartBarProps {
  isCustomizerOpen: boolean;
}

export const StickyCartBar: React.FC<StickyCartBarProps> = ({ isCustomizerOpen }) => {
  const { items, openCart, pricingSummary, isCartOpen } = useCart();

  // If no items, or if cart drawer or customizer modal is currently open, hide
  if (items.length === 0 || isCartOpen || isCustomizerOpen) {
    return null;
  }

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 p-3 sm:hidden bg-gradient-to-t from-neutral-950 via-neutral-950/95 to-transparent pt-4 pb-[max(12px,env(safe-area-inset-bottom,12px))] animate-slide-up pointer-events-none"
      role="region"
      aria-label="Barra rápida de carrito"
    >
      <div className="max-w-md mx-auto pointer-events-auto">
        <button
          onClick={openCart}
          className="w-full min-h-[52px] bg-gradient-to-r from-brand-primary via-red-600 to-amber-600 active:scale-98 text-white px-4 py-3 rounded-2xl shadow-glow-lg flex items-center justify-between transition-all border border-white/10"
          id="sticky-mobile-cart-bar"
        >
          {/* Left item details */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black/30 flex items-center justify-center text-amber-300">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-[10px] uppercase font-black text-amber-300 tracking-wider block">
                Tu Pedido
              </span>
              <span className="text-xs font-bold text-white">
                {totalCount} {totalCount === 1 ? 'producto' : 'productos'}
              </span>
            </div>
          </div>

          {/* Right Price & View Action */}
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-sm text-white">
              {formatCOP(pricingSummary.subtotalCOP)}
            </span>
            <div className="bg-white/20 hover:bg-white/30 text-white font-black text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1">
              <span>VER</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
