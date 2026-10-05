'use client';

import React, { useState } from 'react';
import { PromotionBar } from '@/components/PromotionBar';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ComboCard } from '@/components/ComboCard';
import { ProductCard } from '@/components/ProductCard';
import { ProductCustomizerModal } from '@/components/ProductCustomizerModal';
import { CartDrawer } from '@/components/CartDrawer';
import { StickyCartBar } from '@/components/StickyCartBar';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import {
  SUPER_COMBOS,
  COMBOS_ESPECIALES,
  SIDE_PRODUCTS,
  DESSERT_PRODUCTS,
  DRINK_PRODUCTS,
} from '@/catalog/products';
import { Product, SinglePizzaConfig } from '@/catalog/types';
import { useCart } from '@/context/CartContext';
import { Flame, Sparkles, UtensilsCrossed, Cake, CupSoda } from 'lucide-react';

export default function HomePage() {
  const { addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductSelect = (product: Product) => {
    // If it's a combo or pizza, open customizer modal
    if (product.isCombo || product.category === 'pizzas-individuales') {
      setSelectedProduct(product);
    } else {
      // Direct fast add for sides, desserts, drinks
      addItem(product.id, 1);
    }
  };

  const handleAddToCartFromModal = (
    productId: string,
    quantity: number,
    customization?: {
      pizzas?: SinglePizzaConfig[];
      selectedDrinkIds?: string[];
      customerNotes?: string;
    }
  ) => {
    addItem(productId, quantity, customization);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary selection:bg-brand-primary selection:text-white">
      <PromotionBar />
      <Header />
      <Hero />

      {/* Main Catalog Section with safe mobile bottom padding */}
      <main id="catalogo" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 pb-32 sm:pb-16 w-full space-y-12 sm:space-y-16">
        {/* Category Navigation Bar */}
        <div className="sticky top-16 sm:top-20 z-30 py-3 -mx-4 px-4 sm:mx-0 sm:px-0 glass-nav border-y border-surface-border overflow-x-auto flex items-center gap-2 sm:gap-3 no-scrollbar">
          <a
            href="#super-combos"
            className="flex items-center gap-1.5 whitespace-nowrap bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Super Combos</span>
          </a>
          <a
            href="#combos-especiales"
            className="flex items-center gap-1.5 whitespace-nowrap bg-surface-card hover:bg-surface-hover text-neutral-300 border border-surface-border px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Combos Especiales</span>
          </a>
          <a
            href="#para-acompanar"
            className="flex items-center gap-1.5 whitespace-nowrap bg-surface-card hover:bg-surface-hover text-neutral-300 border border-surface-border px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
            <span>Acompañamientos</span>
          </a>
          <a
            href="#algo-dulce"
            className="flex items-center gap-1.5 whitespace-nowrap bg-surface-card hover:bg-surface-hover text-neutral-300 border border-surface-border px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
          >
            <Cake className="w-3.5 h-3.5 text-pink-400" />
            <span>Algo Dulce</span>
          </a>
          <a
            href="#bebidas"
            className="flex items-center gap-1.5 whitespace-nowrap bg-surface-card hover:bg-surface-hover text-neutral-300 border border-surface-border px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
          >
            <CupSoda className="w-3.5 h-3.5 text-red-400" />
            <span>Bebidas</span>
          </a>
        </div>

        {/* 1. Super Combos */}
        <section id="super-combos" className="scroll-mt-36">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 sm:mb-8 pb-3 border-b border-surface-border">
            <div>
              <div className="flex items-center gap-2 text-brand-primary text-xs font-black tracking-wider uppercase mb-1">
                <Flame className="w-4 h-4 fill-brand-primary" />
                <span>Ofertas Estrella de la Casa</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Super Combos de Pizza
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-sm">
              Precios promocionales fijos en COP. Configura cada pizza a tu gusto con opción de mitad y mitad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUPER_COMBOS.map((combo) => (
              <ComboCard key={combo.id} product={combo} onSelect={handleProductSelect} />
            ))}
          </div>
        </section>

        {/* 2. Combos Especiales */}
        <section id="combos-especiales" className="scroll-mt-36">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 sm:mb-8 pb-3 border-b border-surface-border">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-black tracking-wider uppercase mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Pizza Mediana + Gaseosa 1.5 L</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Combos Especiales
              </h2>
            </div>
            <span className="font-mono text-sm sm:text-base font-extrabold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Todos a $31.900 COP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMBOS_ESPECIALES.map((combo) => (
              <ProductCard key={combo.id} product={combo} onSelect={handleProductSelect} />
            ))}
          </div>
        </section>

        {/* 3. Para Acompañar */}
        <section id="para-acompanar" className="scroll-mt-36">
          <div className="mb-6 sm:mb-8 pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black tracking-wider uppercase mb-1">
              <UtensilsCrossed className="w-4 h-4" />
              <span>Entradas y Snacks</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Para Acompañar
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SIDE_PRODUCTS.map((side) => (
              <ProductCard key={side.id} product={side} onSelect={handleProductSelect} />
            ))}
          </div>
        </section>

        {/* 4. Algo Dulce */}
        <section id="algo-dulce" className="scroll-mt-36">
          <div className="mb-6 sm:mb-8 pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2 text-pink-400 text-xs font-black tracking-wider uppercase mb-1">
              <Cake className="w-4 h-4" />
              <span>Postres y Pizzas Dulces</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Algo Dulce
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DESSERT_PRODUCTS.map((dessert) => (
              <ProductCard key={dessert.id} product={dessert} onSelect={handleProductSelect} />
            ))}
          </div>
        </section>

        {/* 5. Bebidas */}
        <section id="bebidas" className="scroll-mt-36">
          <div className="mb-6 sm:mb-8 pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2 text-red-400 text-xs font-black tracking-wider uppercase mb-1">
              <CupSoda className="w-4 h-4" />
              <span>Gaseosas 1.5 L Frías</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bebidas
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DRINK_PRODUCTS.map((drink) => (
              <ProductCard key={drink.id} product={drink} onSelect={handleProductSelect} />
            ))}
          </div>
        </section>
      </main>

      {/* Interactive Modal */}
      <ProductCustomizerModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCartFromModal}
      />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Mobile Sticky Quick-Action Cart Bar */}
      <StickyCartBar isCustomizerOpen={Boolean(selectedProduct)} />

      <Footer />
      <CookieConsent />
    </div>
  );
}
