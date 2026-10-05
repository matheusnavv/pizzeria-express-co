'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  AlertTriangle,
  RotateCw,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { formatCOP } from '@/catalog/pricing';
import { trackPurchase } from '@/lib/analytics/meta';
import { PIZZA_FLAVORS } from '@/catalog/flavors';
import { CRUST_OPTIONS } from '@/catalog/crusts';
import { EXTRA_INGREDIENTS } from '@/catalog/extras';

interface OrderData {
  id: string;
  publicCode: string;
  customerName: string;
  phone: string;
  department: string;
  city: string;
  barrio: string;
  address: string;
  complement?: string | null;
  deliveryReference?: string | null;
  customerNotes?: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  paidAt?: string | null;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    customizations?: {
      pizzas?: Array<{
        sizeId: string;
        isHalfAndHalf: boolean;
        primaryFlavorId: string;
        secondaryFlavorId?: string;
        crustId: string;
        extraIngredientIds?: string[];
        notes?: string;
      }>;
      selectedDrinkIds?: string[];
    } | null;
  }>;
  payment?: {
    externalId: string;
    providerTransactionId?: string;
    method: string;
    status: string;
    checkoutUrl?: string;
    payeeData?: {
      name?: string;
      accountNumber?: string;
      bankName?: string;
      key?: string;
      keyType?: string;
    };
    expiresAt?: string;
  } | null;
}

export default function OrderPage({ params }: { params: { publicCode: string } }) {
  const { publicCode } = params;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef = useRef(0);

  const fetchOrder = useCallback(
    async (isManualCheck = false) => {
      if (isManualCheck) setIsChecking(true);
      try {
        const res = await fetch(`/api/orders/${publicCode}`);
        const data = await res.json();
        if (res.ok && data.ok) {
          setOrder(data.order);

          // If paid, trigger deduplicated Meta Pixel Purchase event
          if (data.order.paymentStatus === 'paid') {
            trackPurchase({
              orderPublicCode: data.order.publicCode,
              value: data.order.total,
              contentIds: data.order.items.map((i: { productId: string }) => i.productId),
              numItems: data.order.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0),
            });
          }
        } else {
          setError(data.error || 'No se pudo cargar el pedido');
        }
      } catch (err) {
        setError('Error al conectar con el servidor');
      } finally {
        setLoading(false);
        if (isManualCheck) setIsChecking(false);
      }
    },
    [publicCode]
  );

  // Initial load
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Polling while paymentStatus is pending (stops on paid/failed/expired)
  useEffect(() => {
    if (!order || order.paymentStatus !== 'pending') {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    const intervalTime = Math.min(3000 + pollCountRef.current * 1000, 8000); // 3s to 8s backoff

    pollIntervalRef.current = setInterval(() => {
      pollCountRef.current += 1;
      fetchOrder();
    }, intervalTime);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [order, fetchOrder]);

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RotateCw className="w-8 h-8 text-brand-primary animate-spin mx-auto" />
          <p className="text-neutral-400 text-sm">Consultando estado de tu pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-surface-card border border-surface-border rounded-2xl p-8 space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <h1 className="text-xl font-black text-white">Pedido no encontrado</h1>
          <p className="text-neutral-400 text-sm">
            No se encontró información para el código <strong className="text-white">{publicCode}</strong>.
          </p>
          <Link
            href="/"
            className="inline-block bg-brand-primary text-white font-bold text-sm px-6 py-3 rounded-xl shadow-glow"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = order.paymentStatus === 'paid';
  const isFailed = order.paymentStatus === 'failed' || order.paymentStatus === 'expired';

  return (
    <div className="min-h-screen bg-background text-text-primary pb-16">
      {/* Top Header */}
      <header className="glass-nav border-b border-surface-border py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-block" aria-label="DeliPizza">
            <img
              src="/brand/delipizza-logo.png"
              alt="DeliPizza"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>

          <span className="font-mono text-xs font-bold bg-neutral-900 border border-surface-border px-3 py-1.5 rounded-lg text-amber-300">
            {order.publicCode}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ======================================================== */}
        {/* CASE 1: PAID / CONFIRMED ORDER                          */}
        {/* ======================================================== */}
        {isPaid ? (
          <div className="space-y-8 animate-fade-in" aria-live="polite">
            {/* Confirmation Banner */}
            <div className="bg-gradient-to-b from-emerald-950/40 via-surface-card to-surface-card border border-emerald-500/40 rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block mb-1">
                  ¡PAGO CONFIRMADO CON ÉXITO!
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-white">
                  ¡Tu Pedido Fue Confirmado!
                </h1>
              </div>
              <p className="text-neutral-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Recibimos tu pago y tu pedido fue confirmado. Nuestro equipo ya se encuentra preparando tus pizzas recién horneadas.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  Estado: Confirmado para Entrega
                </span>
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Address Details */}
              <div className="bg-surface-card border border-surface-border rounded-2xl p-5 sm:p-6 space-y-4">
                <h2 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Dirección de Entrega
                </h2>
                <div className="space-y-1.5 text-xs sm:text-sm text-neutral-300">
                  <p className="font-bold text-white text-base">{order.customerName}</p>
                  <p className="flex items-center gap-1.5 text-neutral-400">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{order.phone}</span>
                  </p>
                  <p className="text-white pt-1">
                    {order.address} {order.complement ? `(${order.complement})` : ''}
                  </p>
                  <p className="text-neutral-400">
                    Barrio: {order.barrio} — {order.city}, {order.department}
                  </p>
                  {order.deliveryReference && (
                    <p className="text-xs text-neutral-400 italic pt-1">
                      Ref: {order.deliveryReference}
                    </p>
                  )}
                  {order.customerNotes && (
                    <p className="text-xs text-neutral-400 italic pt-1">
                      Instrucciones: {order.customerNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-surface-card border border-surface-border rounded-2xl p-5 sm:p-6 space-y-4">
                <h2 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Detalle del Pago
                </h2>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between text-neutral-400">
                    <span>Código de Pedido</span>
                    <span className="font-mono font-bold text-white">{order.publicCode}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Método de Pago</span>
                    <span className="font-bold text-white">
                      {order.payment?.method === 'NEQUI' ? 'Nequi' : 'Bre-B'}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">{formatCOP(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Domicilio</span>
                    <span className="font-semibold uppercase text-xs">Gratis</span>
                  </div>
                  <div className="flex justify-between font-black text-white text-base pt-3 border-t border-surface-border">
                    <span>Total Pagado</span>
                    <span className="font-mono text-amber-400 text-lg">
                      {formatCOP(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="bg-surface-card border border-surface-border rounded-2xl p-5 sm:p-6 space-y-4">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Productos Preparándose
              </h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-neutral-900/60 rounded-xl border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-sm text-white">
                        {item.quantity}x {item.productName}
                      </div>

                      {/* Customization Details */}
                      {Boolean(item.customizations?.pizzas?.length) && (
                        <div className="text-[11px] text-neutral-400 mt-1 pl-1 space-y-0.5">
                          {item.customizations?.pizzas?.map((p, idx) => {
                            const f1 = PIZZA_FLAVORS.find((f) => f.id === p.primaryFlavorId)?.name;
                            const f2 = p.secondaryFlavorId
                              ? PIZZA_FLAVORS.find((f) => f.id === p.secondaryFlavorId)?.name
                              : null;
                            const crust = CRUST_OPTIONS[p.crustId as keyof typeof CRUST_OPTIONS]?.name;
                            const extras = (p.extraIngredientIds || [])
                              .map((id: string) => EXTRA_INGREDIENTS.find((e) => e.id === id)?.name)
                              .filter(Boolean);

                            return (
                              <div key={idx}>
                                <span>
                                  Pizza {idx + 1}: {p.isHalfAndHalf && f2 ? `${f1} / ${f2}` : f1}
                                </span>
                                {crust && p.crustId !== 'traditional' && (
                                  <span className="text-amber-300 block">+ {crust}</span>
                                )}
                                {extras.length > 0 && (
                                  <span className="text-emerald-400 block">+ Extras: {extras.join(', ')}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <span className="font-mono font-bold text-amber-400 text-sm whitespace-nowrap">
                      {formatCOP(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-sm px-6 py-3 rounded-xl transition-all"
              >
                <span>Hacer otro pedido</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* CASE 2: PENDING PAYMENT (NEQUI / BRE-B SCREEN)           */
          /* ======================================================== */
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in" aria-live="polite">
            <div className="bg-surface-card border border-surface-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
              {/* Status Header */}
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  Esperando Confirmación del Pago
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Paga tu Pedido
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400">
                  {order.payment?.method === 'NEQUI'
                    ? 'Paga desde tu cuenta Nequi para confirmar tu pedido.'
                    : 'Paga al instante desde tu banco o billetera participante de Bre-B.'}
                </p>
              </div>

              {/* Amount to Pay Box */}
              <div className="bg-neutral-900 border border-surface-border rounded-2xl p-5 space-y-1">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                  Total a Pagar
                </span>
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight block">
                  {formatCOP(order.total)}
                </span>
                <span className="text-[11px] text-emerald-400 font-medium block">
                  Domicilio Gratis incluido
                </span>
              </div>

              {/* Payee / Account Details if provided by XPAG */}
              {order.payment?.payeeData && (
                <div className="bg-neutral-900/60 border border-surface-border rounded-2xl p-4 text-left space-y-2 text-xs">
                  <div className="font-bold text-neutral-300 uppercase tracking-wider text-[11px] pb-1 border-b border-white/5">
                    Datos del Beneficiario Oficial
                  </div>
                  {order.payment.payeeData.name && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Titular:</span>
                      <span className="font-semibold text-white">{order.payment.payeeData.name}</span>
                    </div>
                  )}
                  {order.payment.payeeData.bankName && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Entidad:</span>
                      <span className="font-semibold text-white">{order.payment.payeeData.bankName}</span>
                    </div>
                  )}
                  {order.payment.payeeData.key && (
                    <div className="flex justify-between items-center pt-1 border-t border-white/5">
                      <span className="text-neutral-400">Chave / Teléfono Bre-B:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          {order.payment.payeeData.key}
                        </span>
                        <button
                          onClick={() => copyToClipboard(order.payment?.payeeData?.key || '')}
                          className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
                          title="Copiar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                  {order.payment.payeeData.accountNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400">Número de Cuenta:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-white text-xs">
                          {order.payment.payeeData.accountNumber}
                        </span>
                        <button
                          onClick={() => copyToClipboard(order.payment?.payeeData?.accountNumber || '')}
                          className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
                          title="Copiar cuenta"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                  {copiedText && (
                    <div className="text-center text-emerald-400 text-[11px] font-bold">
                      ✓ Copiado al portapapeles
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons: Open App / Checkout URL */}
              <div className="space-y-3">
                {order.payment?.checkoutUrl && (
                  <a
                    href={order.payment.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-red-600 hover:from-red-600 hover:to-red-700 text-white font-extrabold text-base py-3.5 px-6 rounded-xl shadow-glow active:scale-95 transition-all"
                  >
                    <span>ABRIR PASARELA DE PAGO</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                {/* Manual Verify Button */}
                <button
                  type="button"
                  onClick={() => fetchOrder(true)}
                  disabled={isChecking}
                  className="w-full flex items-center justify-center gap-2 bg-surface-hover hover:bg-neutral-800 text-neutral-200 font-bold text-sm py-3 px-6 rounded-xl border border-surface-border transition-colors disabled:opacity-50"
                >
                  <RotateCw className={`w-4 h-4 ${isChecking ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{isChecking ? 'Verificando con el banco...' : 'YA REALICÉ EL PAGO · VERIFICAR'}</span>
                </button>
              </div>

              <div className="p-3 bg-neutral-900/40 rounded-xl text-[11px] text-neutral-400 text-center leading-relaxed">
                Esta pantalla se actualiza automáticamente tan pronto como la red de Nequi o Bre-B reporte tu transacción confirmada.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
