'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent_analytics');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent_analytics', 'granted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent_analytics', 'denied');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 bg-surface-card/95 backdrop-blur-md border-t border-surface-border shadow-2xl animate-slide-up"
      role="region"
      aria-label="Consentimiento de cookies y privacidad"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-neutral-300 text-center sm:text-left">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 hidden sm:block" />
          <span>
            Utilizamos cookies técnicas y analíticas para optimizar tu experiencia y gestionar tus pedidos conforme a la{' '}
            <Link
              href="/politica-de-tratamiento-de-datos"
              className="text-amber-400 hover:underline font-semibold"
            >
              Política de Tratamiento de Datos
            </Link>.
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleDecline}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-surface-border text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors font-medium"
          >
            Solo necesarias
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white font-bold transition-all shadow-sm"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
};
