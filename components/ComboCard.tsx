'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Pizza, CupSoda } from 'lucide-react';
import { Product } from '@/catalog/types';
import { PIZZA_SIZES } from '@/catalog/sizes';
import { formatCOP } from '@/catalog/pricing';
import { getProductImage } from '@/catalog/imageManifest';

interface ComboCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ComboCard: React.FC<ComboCardProps> = ({ product, onSelect }) => {
  const imageUrl = getProductImage(product.image);
  const sizeDetails = product.comboDetails ? PIZZA_SIZES[product.comboDetails.pizzaSizeId] : null;

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative bg-gradient-to-b from-surface-card to-[#121927] hover:from-surface-hover hover:to-[#172134] border border-surface-border hover:border-amber-500/50 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(product);
        }
      }}
      aria-label={`Personalizar ${product.name} por ${formatCOP(product.basePriceCOP)}`}
    >
      {/* Top Banner Tag */}
      {product.badge && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-amber-500 to-red-600 text-neutral-950 font-black text-[11px] sm:text-xs uppercase tracking-wider px-3 py-1 rounded-lg shadow-lg flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
          <span>{product.badge}</span>
        </div>
      )}

      {/* Image container */}
      <div className="relative w-full aspect-[4/3] bg-neutral-900 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Portion Pill */}
        {sizeDetails && product.comboDetails && (
          <div className="absolute bottom-3 right-3 bg-neutral-950/85 backdrop-blur-md text-amber-300 font-extrabold text-xs px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
            <Pizza className="w-3.5 h-3.5" />
            <span>
              {product.comboDetails.pizzaCount} Pizzas {sizeDetails.name} ({sizeDetails.slices} porc. c/u)
            </span>
          </div>
        )}
      </div>

      {/* Body details */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-black text-lg sm:text-xl text-white group-hover:text-amber-400 transition-colors mb-2">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-4">
            {product.description}
          </p>

          {/* Included Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.comboDetails && (
              <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 text-neutral-200 text-xs px-2.5 py-1 rounded-md font-medium">
                <CupSoda className="w-3.5 h-3.5 text-red-400" />
                {product.comboDetails.drinkCount} Gaseosa {product.comboDetails.drinkSize} incluida
              </span>
            )}
            <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs px-2.5 py-1 rounded-md font-medium">
              Sabor a elección
            </span>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="pt-4 border-t border-surface-border flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-neutral-400 block font-semibold uppercase tracking-wider">
              Precio Promocional
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight">
              {formatCOP(product.basePriceCOP)}
            </span>
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-red-600 hover:from-red-600 hover:to-red-700 text-white font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-glow transition-all active:scale-95"
            aria-hidden="true"
          >
            <span>Personalizar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
