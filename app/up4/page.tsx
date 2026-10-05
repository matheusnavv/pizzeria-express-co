'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bike,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  AlertCircle,
  MapPin,
  Star,
  Clock,
} from 'lucide-react';
import { OFERTA_4_CONFIG, DELIVERY_CANDIDATES, DELIVERY_CANDIDATE_INTERVAL_MS } from '@/config/upsellConfig';
import { formatCOP } from '@/catalog/pricing';
import {
  trackUpsellViewed,
  trackUpsellAccepted,
  trackUpsellDeclined,
} from '@/lib/analytics/meta';

function Up4Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '';

  const offer = OFERTA_4_CONFIG;
  const [candidatesVisible, setCandidatesVisible] = useState<Array<{
    name: string;
    distance: string;
    rating: string;
    trips: string;
    reason: string;
    done: boolean;
  }>>([]);
  const [searchFinished, setSearchFinished] = useState(false);
  const [partnerFound, setPartnerFound] = useState(false);

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

  // Sequential candidate cards animation (mirrors backup ra[] and it=1600ms)
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    DELIVERY_CANDIDATES.forEach((candidate, idx) => {
      // Show card appearing
      timeouts.push(
        setTimeout(() => {
          setCandidatesVisible((prev) => [
            ...prev,
            { ...candidate, done: false },
          ]);
        }, idx * DELIVERY_CANDIDATE_INTERVAL_MS)
      );

      // Mark card attempt as finished
      timeouts.push(
        setTimeout(() => {
          setCandidatesVisible((prev) =>
            prev.map((c, i) => (i === idx ? { ...c, done: true } : c))
          );
        }, idx * DELIVERY_CANDIDATE_INTERVAL_MS + 1000)
      );
    });

    // Complete search after all candidates
    timeouts.push(
      setTimeout(() => {
        setSearchFinished(true);
      }, DELIVERY_CANDIDATES.length * DELIVERY_CANDIDATE_INTERVAL_MS)
    );

    // Show partner found
    timeouts.push(
      setTimeout(() => {
        setPartnerFound(true);
      }, DELIVERY_CANDIDATES.length * DELIVERY_CANDIDATE_INTERVAL_MS + 1200)
    );

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const handleFinish = () => {
    trackUpsellDeclined({ offerId: offer.id, sequence: offer.sequence });
    router.push(code ? `/pedido/${code}` : '/');
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
          txId: `tx_up4_${Date.now()}`,
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
            ETAPA FINAL
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-5">
        {/* Radar / Search Animation Header */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5 space-y-4 shadow-xl text-center">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full bg-brand-primary/20 ${!partnerFound ? 'animate-ping' : ''}`} />
            <div className="relative w-12 h-12 rounded-full bg-brand-primary/30 border border-brand-primary text-brand-primary flex items-center justify-center">
              <Bike className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div>
            <h1 className="text-xl font-black text-white">
              {!partnerFound ? 'Buscando Domiciliario Cercano…' : '¡Domiciliario Asociado Localizado!'}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              {!partnerFound
                ? 'Conectando con repartidores en tu zona para entrega inmediata.'
                : 'Se ha asignado un domiciliario exclusivo con maletín térmico para tu pedido.'}
            </p>
          </div>

          {/* Sequential Candidates List */}
          <div className="space-y-2 text-left pt-2">
            {candidatesVisible.map((cand, idx) => (
              <div
                key={idx}
                className="bg-neutral-900 border border-surface-border/60 rounded-xl p-3 flex items-center justify-between text-xs animate-fade-in"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-neutral-300">
                    {cand.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{cand.name}</span>
                      <span className="text-[10px] text-amber-400 flex items-center">
                        <Star className="w-3 h-3 fill-current" /> {cand.rating}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {cand.distance} • {cand.trips} viajes
                    </div>
                  </div>
                </div>

                <div>
                  {cand.done ? (
                    <span className="text-[11px] text-red-400 font-semibold bg-red-950/40 px-2 py-0.5 rounded border border-red-500/20">
                      {cand.reason}
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Consultando
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Partner Found Banner */}
          {partnerFound && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-4 text-center space-y-2 animate-scale-up">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Domiciliario Oficial Asignado: Javier T. (1.1 km)</span>
              </div>
              <p className="text-xs text-neutral-300">
                Para garantizar la salida directa sin paradas intermedias, confirma la tarifa de asignación prioritaria.
              </p>

              {/* Pricing */}
              <div className="flex items-baseline justify-between border-t border-b border-surface-border py-2.5 my-2">
                <span className="text-xs text-neutral-400">Tarifa Repartidor Asociado:</span>
                <span className="text-xl font-black text-amber-400">{formatCOP(offer.priceCOP)}</span>
              </div>

              {/* Payment Method Selector */}
              {!paymentData && (
                <div className="space-y-2 text-left pt-1">
                  <label className="block text-xs font-bold text-neutral-300">
                    Método de pago:
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

              {/* Action Button */}
              {!paymentData ? (
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-base py-3.5 rounded-xl shadow-glow transition-all active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Confirmando domiciliario...</span>
                    </>
                  ) : (
                    <span>CONFIRMAR POR {formatCOP(offer.priceCOP)}</span>
                  )}
                </button>
              ) : (
                <div className="bg-neutral-900 border border-surface-border rounded-xl p-3.5 space-y-2 text-left">
                  <div className="flex items-center justify-between text-xs text-neutral-300">
                    <span className="font-bold text-white">Monto:</span>
                    <span className="font-mono text-amber-400 font-bold">{formatCOP(paymentData.amount)}</span>
                  </div>

                  {paymentData.checkoutUrl ? (
                    <a
                      href={paymentData.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl text-sm"
                    >
                      <span>Pagar en {paymentMethod}</span>
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
                    onClick={handleFinish}
                    className="w-full text-center text-xs text-amber-400 hover:underline pt-1"
                  >
                    Ya pagué, ver estado final del pedido →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Skip / Continue to Final Order */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleFinish}
              className="text-xs text-neutral-400 hover:text-white underline transition-colors"
            >
              Continuar con la asignación estándar de despacho →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Up4Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-white">Cargando etapa...</div>}>
      <Up4Content />
    </Suspense>
  );
}
