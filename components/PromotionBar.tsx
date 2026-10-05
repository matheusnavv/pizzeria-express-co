'use client';

import React from 'react';
import { PromotionCountdown } from './PromotionCountdown';
import { siteConfig } from '@/config/siteConfig';

export const PromotionBar: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-red-950 via-neutral-900 to-red-950 border-b border-red-900/40 text-neutral-100 py-2 px-3 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2 mx-auto sm:mx-0 font-medium">
          <span className="bg-brand-primary text-white font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
            Promo Online
          </span>
          <span className="hidden sm:inline text-neutral-300">
            {siteConfig.commerce.deliveryHeadline} según cobertura
          </span>
          <span className="hidden md:inline text-neutral-500">•</span>
          <span className="text-amber-300 font-semibold">
            Pedido mínimo ${siteConfig.commerce.minOrderCOP.toLocaleString('es-CO')}
          </span>
        </div>

        <div className="mx-auto sm:mx-0">
          <PromotionCountdown />
        </div>
      </div>
    </div>
  );
};
