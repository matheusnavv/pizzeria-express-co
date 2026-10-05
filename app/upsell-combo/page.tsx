'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Clock,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { UPSELL_COMBO_CONFIG } from '@/config/upsellConfig';
import { formatCOP } from '@/catalog/pricing';
import {
  trackUpsellViewed,
  trackUpsellAccepted,
  trackUpsellDeclined,
  trackUpsellPurchase,
} from '@/lib/analytics/meta';

function UpsellComboContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '';

  const offer = UPSELL_COMBO_CONFIG;

  // Timer state with localStorage persistence
  const TIMER_STORAGE_KEY = 'delipizza_upsell_combo_timer';
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    return offer.timerSeconds;
  });

  const [paymentMethod, setPaymentMethod] = useState<'NEQUI' | 'BREB'>('NEQUI');
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    txId: string;
    checkoutUrl?: string;
    payeeData?: unknown;
    amount: number;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Track view
  useEffect(() => {
    trackUpsellViewed({
      offerId: offer.id,
      sequence: offer.sequence,
      productId: offer.id,
      offerPriceCOP: offer.priceCOP,
    });
  }, [offer]);

  // Persistent timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - 1);
        if (typeof window !== 'undefined') {
          localStorage.setItem(TIMER_STORAGE_KEY, next.toString());
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Format timer MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
        // Fallback demo/sandbox without order code
        setPaymentData({
          txId: `tx_demo_${Date.now()}`,
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
      {/* Brand Header */}
      <header className="sticky top-0 z-40 glass-nav border-b border-surface-border py-3 px-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" aria-label="DeliPizza">
            <img
              src="/brand/delipizza-logo.png"
              alt="DeliPizza"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{formatTimer(timeLeft)}</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Urgency Badge */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
            <Flame className="w-3.5 h-3.5" />
            {offer.badge}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-3 leading-tight tracking-tight">
            {offer.title}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
            {offer.subtitle}
          </p>
        </div>

        {/* Product Card */}
        <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-xl">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
            <img
              src={offer.image}
              alt={offer.title}
              className="w-full h-full object-cover"
            />
            {offer.discountPercent && (
              <span className="absolute top-3 right-3 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-lg">
                -{offer.discountPercent}% OFF
              </span>
            )}
          </div>

          <div className="p-5 space-y-4">
            {/* Pricing Details */}
            <div className="flex items-baseline justify-between border-b border-surface-border pb-3">
              <div>
                <span className="text-xs text-neutral-400 line-through block">
                  {offer.compareAtPriceCOP && formatCOP(offer.compareAtPriceCOP)}
                </span>
                <span className="text-2xl font-black text-amber-400">
                  {formatCOP(offer.priceCOP)}
                </span>
              </div>
              {offer.savingsCOP && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                  Ahorras {formatCOP(offer.savingsCOP)}
                </span>
              )}
            </div>

            {/* Stock Warning */}
            <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <span className="font-bold">⚠️ Quedan solo {offer.stockRemaining || 3} combos disponibles a este precio.</span>
            </div>

            {/* Payment Method Selector if not yet generated */}
            {!paymentData && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-300">
                  Selecciona método de pago:
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

            {/* CTA Button */}
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
                    <span>Generando código...</span>
                  </>
                ) : (
                  <span>{offer.ctaLabel} {formatCOP(offer.priceCOP)}</span>
                )}
              </button>
            ) : (
              /* Inline Payment Box */
              <div className="bg-neutral-900 border border-surface-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-300">
                  <span className="font-bold text-white">Total Adicional:</span>
                  <span className="font-mono text-amber-400 font-bold">{formatCOP(paymentData.amount)}</span>
                </div>

                {paymentData.checkoutUrl ? (
                  <a
                    href={paymentData.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl text-sm"
                  >
                    <span>Abrir y Pagar en {paymentMethod}</span>
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
                  Ya realicé el pago, continuar →
                </button>
              </div>
            )}

            {/* Decline Button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleDecline}
                className="text-xs text-neutral-400 hover:text-white underline transition-colors"
              >
                No, gracias. Continuar con mi pedido actual →
              </button>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        {offer.testimonials && offer.testimonials.length > 0 && (
          <div className="space-y-3 pt-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block text-center">
              Opiniones de clientes verificados
            </span>
            <div className="grid grid-cols-1 gap-2.5">
              {offer.testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-surface-card/60 border border-surface-border rounded-xl p-3 text-xs space-y-1"
                >
                  <div className="flex items-center gap-1 text-amber-400">
                    {'★'.repeat(5)}
                    <span className="text-[11px] font-bold text-white ml-1">{t.name}</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed italic">{t.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function UpsellComboPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-white">Cargando oferta...</div>}>
      <UpsellComboContent />
    </Suspense>
  );
}
