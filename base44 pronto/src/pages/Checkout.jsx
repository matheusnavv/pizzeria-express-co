import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Loader2 } from 'lucide-react';
import { db } from '@/api/base44Client';

import { useCart } from '@/context/CartContext';
import { formatCOP } from '@/lib/format';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    address: '',
    city: localStorage.getItem('lead_city') || '',
    payment_method: 'nequi',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await db.entities.Order.create({
        items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        total,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        address: form.address,
        city: form.city,
        payment_method: form.payment_method,
        status: 'pending',
      });
      clear();
      setDone(true);
    } catch (err) {
      alert('Error al finalizar el pedido. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-3xl p-8 text-center shadow-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">¡Pedido confirmado!</h1>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            Tu pizza ya se está preparando. Entrega estimada en 25-30 minutos. 🍕
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl"
          >
            Volver al menú
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <p className="font-semibold text-slate-700">Tu carrito está vacío</p>
        <button onClick={() => navigate('/')} className="mt-4 bg-orange-500 text-white font-semibold px-6 py-2.5 rounded-2xl">
          Ver menú
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-xl">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-slate-900">Finalizar pedido</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <h2 className="font-bold text-slate-900 text-sm mb-3">Resumen</h2>
          <div className="space-y-2">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="text-slate-600">{i.qty}x {i.name}</span>
                <span className="font-semibold">{formatCOP(i.price * i.qty)} COP</span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-2 flex justify-between">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-orange-600 text-lg">{formatCOP(total)} COP</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
          <h2 className="font-bold text-slate-900 text-sm">Tus datos</h2>
          <input
            required
            placeholder="Nombre completo"
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          <input
            required
            placeholder="Teléfono / WhatsApp"
            value={form.customer_phone}
            onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          <input
            required
            placeholder="Dirección completa (calle, número, apartamento)"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          <input
            required
            placeholder="Ciudad"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <h2 className="font-bold text-slate-900 text-sm mb-3">Pago</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'nequi', label: 'Nequi', icon: '⚡' },
              { id: 'brep', label: 'Bre-B', icon: '🏦' },
              { id: 'efectivo', label: 'Efectivo', icon: '💵' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setForm({ ...form, payment_method: opt.id })}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 text-sm transition-all ${
                  form.payment_method === opt.id
                    ? 'border-orange-500 bg-orange-50 text-orange-600 font-semibold'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                <span className="text-xl">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 transition-colors text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Confirmando pedido...
            </>
          ) : (
            `Confirmar pedido • ${formatCOP(total)} COP`
          )}
        </button>
      </form>
    </div>
  );
}