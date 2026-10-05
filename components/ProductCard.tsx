'use client';

import React from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Product } from '@/catalog/types';
import { formatCOP } from '@/catalog/pricing';
import { getProductImage } from '@/catalog/imageManifest';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const imageUrl = getProductImage(product.image);

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-surface-card hover:bg-surface-hover border border-surface-border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-brand-primary/40 cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(product);
        }
      }}
      aria-label={`Seleccionar ${product.name} por ${formatCOP(product.basePriceCOP)}`}
    >
      {/* Product Image */}
      <div className="relative w-full aspect-square bg-neutral-900 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-brand-primary to-red-600 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md">
            {product.badge}
          </div>
        )}

        {/* Portions / Headline Tag */}
        {product.headline && (
          <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm text-neutral-200 text-xs font-semibold px-2.5 py-0.5 rounded-md border border-white/10">
            {product.headline}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-1.5">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>

        {/* Footer with Price and Button */}
        <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-neutral-400 block font-medium uppercase tracking-wider">
              {product.isCombo ? 'Desde' : 'Precio'}
            </span>
            <span className="text-base sm:text-xl font-black text-amber-400 font-mono">
              {formatCOP(product.basePriceCOP)}
            </span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl shadow-glow transition-all active:scale-95"
            aria-hidden="true"
          >
            <Plus className="w-4 h-4" />
            <span>{product.isCombo ? 'Elegir' : 'Agregar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
