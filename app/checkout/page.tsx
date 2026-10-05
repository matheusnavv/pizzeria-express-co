'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  Building,
  CreditCard,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCOP } from '@/catalog/pricing';
import { siteConfig } from '@/config/siteConfig';
import { PIZZA_FLAVORS } from '@/catalog/flavors';
import { CRUST_OPTIONS } from '@/catalog/crusts';
import { EXTRA_INGREDIENTS } from '@/catalog/extras';
import { DRINKS_CATALOG } from '@/catalog/drinks';
import { trackInitiateCheckout, trackAddPaymentInfo } from '@/lib/analytics/meta';

const COLOMBIAN_DEPARTMENTS = [
  'Antioquia',
  'Atlántico',
  'Bogotá D.C.',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Caquetá',
  'Cauca',
  'Cesar',
  'Córdoba',
  'Cundinamarca',
  'Huila',
  'La Guajira',
  'Magdalena',
  'Meta',
  'Nariño',
  'Norte de Santander',
  'Quindío',
  'Risaralda',
  'Santander',
  'Sucre',
  'Tolima',
  'Valle del Cauca',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, pricingSummary, clearCart } = useCart();

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Antioquia');
  const [city, setCity] = useState('');
  const [barrio, setBarrio] = useState('');
  const [address, setAddress] = useState('');
  const [complement, setComplement] = useState('');
  const [deliveryReference, setDeliveryReference] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'NEQUI' | 'BREB'>('NEQUI');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Track InitiateCheckout on mount
  useEffect(() => {
    if (items.length > 0) {
      trackInitiateCheckout({
        value: pricingSummary.totalCOP,
        numItems: pricingSummary.itemCount,
        contentIds: items.map((i) => i.productId),
      });
    }
  }, [items, pricingSummary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic client validation
    if (!customerName.trim() || customerName.trim().length < 3) {
      setErrorMessage('Por favor ingresa tu nombre completo.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const normalizedPhone =
      cleanPhone.startsWith('57') && cleanPhone.length === 12
        ? cleanPhone.slice(2)
        : cleanPhone;

    if (!/^3\d{9}$/.test(normalizedPhone)) {
      setErrorMessage('Ingresa un número celular colombiano válido de 10 dígitos (ej. 3001234567).');
      return;
    }

    if (!city.trim()) {
      setErrorMessage('Ingresa la ciudad o municipio de entrega.');
      return;
    }

    if (!barrio.trim()) {
      setErrorMessage('Ingresa el barrio de entrega.');
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setErrorMessage('Ingresa la dirección exacta (calle, carrera y número).');
      return;
    }

    if (!pricingSummary.isMinOrderMet) {
      setErrorMessage(
        `El pedido mínimo es de $${siteConfig.commerce.minOrderCOP.toLocaleString('es-CO')} COP.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      trackAddPaymentInfo({
        value: pricingSummary.totalCOP,
        paymentMethod,
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: normalizedPhone,
          department: department.trim(),
          city: city.trim(),
          barrio: barrio.trim(),
          address: address.trim(),
          complement: complement.trim() || undefined,
          deliveryReference: deliveryReference.trim() || undefined,
          customerNotes: customerNotes.trim() || undefined,
          paymentMethod,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            customization: i.customization,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Error al procesar el pedido.');
      }

      // Order created successfully!
      // Clear cart so items don't linger
      clearCart();

      // Redirect to order payment & tracking page
      router.push(`/pedido/${data.order.publicCode}`);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Error inesperado al crear el pedido. Intenta nuevamente.'
      );
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-surface-card border border-surface-border rounded-2xl p-8 space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h1 className="text-xl font-black text-white">Tu carrito está vacío</h1>
          <p className="text-neutral-400 text-sm">
            Agrega deliciosas pizzas o combos a tu pedido antes de ir a pagar.
          </p>
          <Link
            href="/"
            className="inline-block bg-brand-primary text-white font-bold text-sm px-6 py-3 rounded-xl shadow-glow"
          >
            Ver Menú y Combos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-16">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 glass-nav border-b border-surface-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al menú</span>
          </Link>

          <span className="font-extrabold text-base sm:text-lg text-white">
            Checkout Seguro
          </span>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Conexión Encriptada</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Delivery & Payment Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* ETAPA 1: Datos de Entrega */}
            <div className="bg-surface-card border border-surface-border rounded-2xl p-5 sm:p-7 space-y-5 shadow-lg">
              <div className="flex items-center gap-3 pb-4 border-b border-surface-border">
                <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Datos de Entrega</h2>
                  <p className="text-xs text-neutral-400">
                    No necesitas crear cuenta ni contraseña. Directo a tu dirección.
                  </p>
                </div>
              </div>

              {/* Campos en flujo móvil ergonómico */}
              <div className="space-y-4">
                {/* Nombre Completo */}
                <div>
                  <label className="block text-xs font-black text-neutral-200 uppercase tracking-wider mb-1.5">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-4" />
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      autoCapitalize="words"
                      placeholder="Ej. Carlos Mendoza"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full min-h-[50px] bg-neutral-900 border border-surface-border rounded-xl pl-10 pr-3.5 text-sm sm:text-base text-white placeholder-neutral-500 focus:border-brand-primary"
                    />
                  </div>
                </div>

                {/* Celular Colombia */}
                <div>
                  <label className="block text-xs font-black text-neutral-200 uppercase tracking-wider mb-1.5">
                    Celular (Colombia) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-4" />
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      placeholder="Ej. 300 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full min-h-[50px] bg-neutral-900 border border-surface-border rounded-xl pl-10 pr-3.5 text-sm sm:text-base text-white placeholder-neutral-500 focus:border-brand-primary"
                    />
                  </div>
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    10 dígitos (utilizado para coordinar entrega y pago Nequi/Bre-B)
                  </span>
                </div>

                {/* Departamento */}
                <div>
                  <label className="block text-xs font-black text-neutral-200 uppercase tracking-wider mb-1.5">
                    Departamento *
                  </label>
                  <select
                    value={department}
                    autoComplete="address-level1"
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full min-h-[50px] bg-neutral-900 border border-surface-border rounded-xl px-3.5 text-sm sm:text-base text-white focus:border-brand-primary"
                  >
                    {COLOMBIAN_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ciudad o Municipio */}
                <div>
                  <label className="block text-xs font-black text-neutral-200 uppercase tracking-wider mb-1.5">
                    Ciudad o Municipio *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-neutral-500 absolute left-3.5 top-4" />
                    <input
                      type="text"
                      required
                      autoComplete="address-level2"
                      placeholder="Ej. Medellín, Bogotá, Cali, Envigado..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full min-h-[50px] bg-neutral-900 border border-surface-border rounded-xl pl-10 pr-3.5 text-sm sm:text-base text-white placeholder-neutral-500 focus:border-brand-primary"
                    />
                  </div>
                </div>

                {/* Barrio */}
                <div>
                  <label className="block text-xs font-black text-neutral-200 uppercase tracking-wider mb-1.5">
                    Barrio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. El Poblado, Chapinero, San Fernando..."
                    value={barrio}
                    onChange={(e) => setBarrio(e.target.value)}
                    className="w-full min-h-[50px] bg-neutral-900 border border-surface-border rounded-xl px-3.5 text-sm sm:text-base text-white placeholder-neutral-500 focus:border-brand-primary"
                  />
                </div>

                {/* Dirección Exacta */}
                <div>
                  <label className="block text-xs font-black text-neutral-200 uppercase tracking-wider mb-1.5">
                    Dirección Exacta (Calle, Carrera, Número) *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-neutral-500 absolute left-3.5 top-4" />
                    <input
                      type="text"
                      required
                      autoComplete="street-address"
                      placeholder="Ej. Carrera 43A # 5A - 113"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full min-h-[50px] bg-neutral-900 border border-surface-border rounded-xl pl-10 pr-3.5 text-sm sm:text-base text-white placeholder-neutral-500 focus:border-brand-primary"
                    />
                  </div>
                </div>

                {/* Complemento y Referencia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Apto / Casa / Torre (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Apto 402, Torre B"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="w-full min-h-[50px] bg-neutral-900 border border-surface-border rounded-xl px-3.5 text-sm text-white placeholder-neutral-500 focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Referencia de entrega (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Frente a la panadería"
                      value={deliveryReference}
                      onChange={(e) => setDeliveryReference(e.target.value)}
                      className="w-full min-h-[50px] bg-neutral-900 border border-surface-border rounded-xl px-3.5 text-sm text-white placeholder-neutral-500 focus:border-brand-primary"
                    />
                  </div>
                </div>

                {/* Notas del pedido */}
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Instrucciones para el domiciliario (opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Instrucciones adicionales para la entrega..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full bg-neutral-900 border border-surface-border rounded-xl p-3 text-sm text-white placeholder-neutral-500 focus:border-brand-primary"
                  />
                </div>
              </div>
            </div>

            {/* ETAPA 3: Método de Pago */}
            <div className="bg-surface-card border border-surface-border rounded-2xl p-5 sm:p-7 space-y-5 shadow-lg">
              <div className="flex items-center gap-3 pb-4 border-b border-surface-border">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Elige cómo pagar</h2>
                  <p className="text-xs text-neutral-400">
                    Pagos directos en pesos colombianos (COP).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NEQUI */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('NEQUI')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'NEQUI'
                      ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500'
                      : 'bg-neutral-900/60 border-surface-border hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="font-extrabold text-base text-purple-300">Nequi</span>
                    {paymentMethod === 'NEQUI' && (
                      <CheckCircle2 className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Paga al instante escaneando código QR o directo desde tu app Nequi.
                  </p>
                </button>

                {/* BRE-B */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('BREB')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'BREB'
                      ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500'
                      : 'bg-neutral-900/60 border-surface-border hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="font-extrabold text-base text-blue-300">Bre-B</span>
                    {paymentMethod === 'BREB' && (
                      <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Paga desde cualquier banco colombiano o billetera interoperable.
                  </p>
                </button>
              </div>

              <div className="p-3 bg-neutral-900/70 border border-surface-border rounded-xl flex items-center gap-3 text-xs text-neutral-400">
                <CreditCard className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span>
                  Procesado con tecnología oficial XPAG Colombia. Tu pago se valida automáticamente sin enviar comprobantes.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface-card border border-surface-border rounded-2xl p-5 sm:p-6 space-y-5 sticky top-24 shadow-xl">
              <h3 className="font-black text-base sm:text-lg text-white pb-3 border-b border-surface-border">
                Resumen de tu Pedido
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.cartItemId} className="text-xs space-y-1 pb-3 border-b border-white/5 last:border-0">
                    <div className="flex justify-between font-bold text-white">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-mono text-amber-400">
                        {formatCOP(item.totalPriceCOP)}
                      </span>
                    </div>

                    {/* Customization Details */}
                    {item.customization?.pizzas && (
                      <div className="text-[11px] text-neutral-400 pl-2 space-y-0.5">
                        {item.customization.pizzas.map((p, idx) => {
                          const f1 = PIZZA_FLAVORS.find((f) => f.id === p.primaryFlavorId)?.name;
                          const f2 = p.secondaryFlavorId
                            ? PIZZA_FLAVORS.find((f) => f.id === p.secondaryFlavorId)?.name
                            : null;
                          const crust = CRUST_OPTIONS[p.crustId]?.name;
                          const extras = (p.extraIngredientIds || [])
                            .map((id) => EXTRA_INGREDIENTS.find((e) => e.id === id)?.name)
                            .filter(Boolean);

                          return (
                            <div key={idx}>
                              <span>
                                Pizza {idx + 1}: {p.isHalfAndHalf && f2 ? `${f1} / ${f2}` : f1}
                              </span>
                              {crust && p.crustId !== 'traditional' && (
                                <span className="block text-amber-300">+ {crust}</span>
                              )}
                              {extras.length > 0 && (
                                <span className="block text-emerald-400">+ Extras: {extras.join(', ')}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2 pt-3 border-t border-surface-border text-xs text-neutral-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium text-white">
                    {formatCOP(pricingSummary.subtotalCOP)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Domicilio</span>
                  <span className="uppercase text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {siteConfig.commerce.deliveryHeadline}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-surface-border">
                  <span>Total a pagar</span>
                  <span className="font-mono text-amber-400 text-lg">
                    {formatCOP(pricingSummary.totalCOP)}
                  </span>
                </div>
              </div>

              {/* Error Box if any */}
              {errorMessage && (
                <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Final Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !pricingSummary.isMinOrderMet}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-base py-4 px-6 rounded-xl shadow-glow active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                id="submit-checkout-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generando Pago Seguro...</span>
                  </>
                ) : (
                  <>
                    <span>CONFIRMAR Y PAGAR</span>
                    <span className="font-mono text-amber-300 font-black">
                      {formatCOP(pricingSummary.totalCOP)}
                    </span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-neutral-500 text-center leading-relaxed">
                Al confirmar tu pedido aceptas nuestros{' '}
                <Link href="/terminos-y-condiciones" className="text-neutral-400 underline">
                  Términos y Condiciones
                </Link>{' '}
                y el tratamiento de tus datos personales para la entrega.
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
