'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  ThermometerSnowflake,
  PackageCheck,
} from 'lucide-react';
import { OFERTA_2_CONFIG } from '@/config/upsellConfig';
import { formatCOP } from '@/catalog/pricing';
import {
  trackUpsellViewed,
  trackUpsellAccepted,
  trackUpsellDeclined,
} from '@/lib/analytics/meta';

function Up2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '';

  const offer = OFERTA_2_CONFIG;
  const [paymentMethod, setPaymentMethod] = useState<'NEQUI' | 'BREB'>('NEQUI');
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    txId: string;
    checkoutUrl?: string;
    payeeData?: unknown;
    amount: number;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    trackUpsellViewed({
      offerId: offer.id,
      sequence: offer.sequence,
      productId: offer.id,
      offerPriceCOP: offer.priceCOP,
    });
  }, [offer]);

  const handleDecline = () => {
    trackUpsellDeclined({ offerId: offer.id, sequence: offer.sequence });
    router.push(`${offer.onDeclinePath}${code ? `?code=${code}` : ''}`);
  };

  const handleAccept = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    trackUpsellAccepted({
      offerId: offer.id,
      sequence: offer.sequence,
      productId: offer.id,
      offerPriceCOP: offer.priceCOP,
    });

    try {
      if (code) {
        const res = await fetch(`/api/orders/${code}/upsell`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ upsellSlug: offer.slug, paymentMethod }),
        });
        const data = await res.json();
        if (data.ok && data.transaction) {
          setPaymentData({
            txId: data.transaction.id,
            checkoutUrl: data.transaction.checkoutUrl,
            payeeData: data.transaction.payeeData,
            amount: data.transaction.amount,
          });
        }
      } else {
        setPaymentData({
          txId: `tx_up2_${Date.now()}`,
          amount: offer.priceCOP,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-20 selection:bg-brand-primary selection:text-white">
      {/* Header with Official Logo */}
      <header className="sticky top-0 z-40 glass-nav border-b border-surface-border py-3 px-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" aria-label="DeliPizza">
            <img
              src="/brand/delipizza-logo.png"
              alt="DeliPizza"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            ETAPA 2 DE 4
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-5">
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="text-center space-y-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-0.5 rounded-full">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-400" />
              Cadena de Temperatura Certificada
            </span>
            <h1 className="text-xl font-black text-white">{offer.title}</h1>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {offer.subtitle}
            </p>
          </div>

          {/* Benefits info card */}
          <div className="bg-neutral-900/80 border border-surface-border rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-start gap-2.5 text-neutral-300">
              <PackageCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Caja térmica sellada:</strong> Conserva el queso derretido y la pizza crujiente como recién salida del horno.</span>
            </div>
            <div className="flex items-start gap-2.5 text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Separador anticolisión:</strong> Evita que los ingredientes toquen la tapa durante el transporte en moto.</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline justify-between border-t border-b border-surface-border py-3">
            <div>
              <span className="text-xs text-neutral-400 line-through block">
                {offer.compareAtPriceCOP && formatCOP(offer.compareAtPriceCOP)}
              </span>
              <span className="text-2xl font-black text-amber-400">
                {formatCOP(offer.priceCOP)}
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              Embalaje Térmico
            </span>
          </div>

          {/* Payment Method Selector */}
          {!paymentData && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-300">
                Selecciona cómo pagar la TMT:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('NEQUI')}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    paymentMethod === 'NEQUI'
                      ? 'bg-purple-950/60 border-purple-500 text-purple-200 ring-1 ring-purple-500'
                      : 'bg-neutral-900/60 border-surface-border text-neutral-400'
                  }`}
                >
                  <img src="/brand/nequi-logo.png" alt="Nequi" className="h-5 w-auto object-contain rounded" />
                  <span>Nequi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('BREB')}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    paymentMethod === 'BREB'
                      ? 'bg-blue-950/60 border-blue-500 text-blue-200 ring-1 ring-blue-500'
                      : 'bg-neutral-900/60 border-surface-border text-neutral-400'
                  }`}
                >
                  <img src="/brand/breb-logo.png" alt="Bre-B" className="h-5 w-auto object-contain rounded" />
                  <span>Bre-B</span>
                </button>
              </div>
            </div>
          )}

          {/* Action CTA */}
          {!paymentData ? (
            <button
              type="button"
              onClick={handleAccept}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-base py-4 rounded-xl shadow-glow transition-all active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generando pago...</span>
                </>
              ) : (
                <span>{offer.ctaLabel} {formatCOP(offer.priceCOP)}</span>
              )}
            </button>
          ) : (
            <div className="bg-neutral-900 border border-surface-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="font-bold text-white">Monto TMT:</span>
                <span className="font-mono text-amber-400 font-bold">{formatCOP(paymentData.amount)}</span>
              </div>

              {paymentData.checkoutUrl ? (
                <a
                  href={paymentData.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl text-sm"
                >
                  <span>Abrir App y Pagar</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => copyCode(paymentData.txId)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>{isCopied ? '¡Código Copiado!' : 'Copiar Código de Pago'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => router.push(`${offer.onAcceptPath}${code ? `?code=${code}` : ''}`)}
                className="w-full text-center text-xs text-amber-400 hover:underline pt-1"
              >
                Ya pagué, continuar al paso 3 →
              </button>
            </div>
          )}

          {/* Decline Link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleDecline}
              className="text-xs text-neutral-400 hover:text-white underline transition-colors"
            >
              Omitir este paso y continuar →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Up2Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-white">Cargando etapa...</div>}>
      <Up2Content />
    </Suspense>
  );
}
