'use client';

import React from 'react';
import { ArrowDown, Flame, ShieldCheck, Zap } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import { StoreStatusBadge } from './StoreStatus';

export const Hero: React.FC = () => {
  const scrollToMenu = () => {
    const el = document.getElementById('catalogo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 border-b border-surface-border bg-gradient-to-b from-[#131b2b] via-[#0d121c] to-background">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-brand-primary/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-5 sm:mb-6">
          <StoreStatusBadge />
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Super Combos desde $27.900 COP
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            {siteConfig.commerce.deliveryHeadline}
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none mb-4 sm:mb-6">
          PIZZA RECIÉN HORNEADA <br />
          <span className="bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
            DIRECTO A TU PUERTA
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-neutral-300 text-sm sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Pide tus pizzas favoritas con{' '}
          <strong className="text-amber-300 font-semibold">mitad y mitad</strong>, bordes rellenos de queso o queso y bocadillo, e ingredientes adicionales. Pagos al instante con{' '}
          <strong className="text-white font-semibold">Nequi o Bre-B</strong>.
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-10">
          <button
            onClick={scrollToMenu}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-brand-primary via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-glow hover:shadow-glow-lg transition-all active:scale-95"
            id="hero-cta-menu"
          >
            <span>PEDIR AHORA</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto text-left">
          <div className="bg-surface-card/60 border border-surface-border p-3 sm:p-4 rounded-xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10 text-brand-primary">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white">Domicilio Gratis</div>
              <div className="text-[11px] text-neutral-400">Según cobertura</div>
            </div>
          </div>

          <div className="bg-surface-card/60 border border-surface-border p-3 sm:p-4 rounded-xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white">Nequi & Bre-B</div>
              <div className="text-[11px] text-neutral-400">Pagos 100% seguros</div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-surface-card/60 border border-surface-border p-3 sm:p-4 rounded-xl flex items-center justify-center sm:justify-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-white">Pedido Mínimo</div>
              <div className="text-[11px] text-neutral-400">$27.900 COP</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
