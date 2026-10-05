'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-surface-border bg-neutral-950 text-neutral-400 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Brand Column with Official Logo */}
        <div className="space-y-3 md:col-span-2">
          <Link href="/" className="inline-block">
            <img
              src="/brand/delipizza-logo.png"
              alt={siteConfig.brand.name}
              className="h-10 w-auto object-contain brightness-110"
            />
          </Link>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed">
            {siteConfig.brand.description}
          </p>
          <div className="text-xs text-amber-300 font-semibold pt-1">
            {siteConfig.commerce.deliverySubtext}
          </div>
        </div>

        {/* Schedule Column */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-white uppercase tracking-wider">
            Horario de Atención
          </h4>
          <p className="text-xs leading-relaxed text-neutral-300">
            Lunes a Domingo: <br />
            11:30 AM – 11:00 PM (Fin de semana hasta las 11:59 PM)
          </p>
          <p className="text-xs text-neutral-400">
            Zona horaria oficial de Colombia (UTC-5).
          </p>
        </div>

        {/* Legal Column */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-white uppercase tracking-wider">
            Marco Legal y Privacidad
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link
                href="/politica-de-tratamiento-de-datos"
                className="hover:text-amber-400 transition-colors"
              >
                Política de Tratamiento de Datos
              </Link>
            </li>
            <li>
              <Link
                href="/terminos-y-condiciones"
                className="hover:text-amber-400 transition-colors"
              >
                Términos y Condiciones del Servicio
              </Link>
            </li>
          </ul>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ley 1581 de 2012 (Habeas Data)</span>
          </div>
        </div>
      </div>

      {/* Payment methods & Copyright */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-surface-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-neutral-400">Pagos habilitados en Colombia:</span>
          <span className="inline-flex items-center gap-1.5 bg-neutral-900 text-neutral-200 font-bold px-2 py-1 rounded-md border border-neutral-800">
            <img src="/brand/nequi-logo.png" alt="Nequi" className="h-4 w-auto object-contain rounded" />
            <span>Nequi</span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-neutral-900 text-neutral-200 font-bold px-2 py-1 rounded-md border border-neutral-800">
            <img src="/brand/breb-logo.png" alt="Bre-B" className="h-4 w-auto object-contain rounded" />
            <span>Bre-B</span>
          </span>
        </div>

        <p className="text-neutral-400 text-center sm:text-right">
          © {new Date().getFullYear()} {siteConfig.brand.name}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};
