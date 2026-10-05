'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Copy,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { OFERTA_1_CONFIG } from '@/config/upsellConfig';
import { formatCOP } from '@/catalog/pricing';
import {
  trackUpsellViewed,
  trackUpsellAccepted,
  trackUpsellDeclined,
  trackUpsellPurchase,
} from '@/lib/analytics/meta';

function Up1Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '';

  const offer = OFERTA_1_CONFIG;
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
          txId: `tx_up1_${Date.now()}`,
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
            ETAPA 1 DE 4
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Status Confirmation Box (mirrors backup order tracking start) */}
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-1">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h2 className="text-base font-black text-emerald-300">¡Pago Principal Confirmado!</h2>
          <p className="text-xs text-neutral-300">
            {code ? `Tu orden #${code} fue recibida.` : 'Tu orden fue recibida.'}
          </p>
        </div>

        {/* Real-time Steps Tracker */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-4 space-y-3 shadow-lg">
          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block text-center">
            Estado de tu despacho en tiempo real
          </span>
          <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
            <div className="space-y-1">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-neutral-950 font-bold flex items-center justify-center mx-auto text-xs">✓</div>
              <span className="text-emerald-400 font-bold block leading-tight">Pago Recibido</span>
            </div>
            <div className="space-y-1">
              <div className="w-6 h-6 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center mx-auto text-xs animate-pulse">2</div>
              <span className="text-white font-bold block leading-tight">Ajuste Ruta</span>
            </div>
            <div className="space-y-1 opacity-50">
              <div className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-400 font-bold flex items-center justify-center mx-auto text-xs">3</div>
              <span className="text-neutral-400 block leading-tight">Control TMT</span>
            </div>
            <div className="space-y-1 opacity-50">
              <div className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-400 font-bold flex items-center justify-center mx-auto text-xs">4</div>
              <span className="text-neutral-400 block leading-tight">Despacho</span>
            </div>
          </div>
        </div>

        {/* Main Offer Card */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="text-center space-y-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Prioridad en Cola de Horneado
            </span>
            <h1 className="text-xl font-black text-white">{offer.title}</h1>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {offer.subtitle}
            </p>
          </div>

          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-neutral-900 border border-surface-border">
            <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
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
              Entrega Prioritaria
            </span>
          </div>

          {/* Payment Method Selector */}
          {!paymentData && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-300">
                Elige cómo pagar este ajuste:
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
                  <span>Generando ajuste...</span>
                </>
              ) : (
                <span>{offer.ctaLabel} {formatCOP(offer.priceCOP)}</span>
              )}
            </button>
          ) : (
            <div className="bg-neutral-900 border border-surface-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="font-bold text-white">Monto a pagar:</span>
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
                Ya pagué, continuar al siguiente paso →
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
              No deseo prioridad de ruta, continuar →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Up1Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-white">Cargando etapa...</div>}>
      <Up1Content />
    </Suspense>
  );
}
