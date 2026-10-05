import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { formatCOP } from '@/lib/format';

export default function CartDrawer() {
  const { items, isOpen, close, inc, dec, remove, total, count } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const goCheckout = () => {
    close();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-slate-900">Tu carrito</h2>
            {count > 0 && <span className="text-sm text-slate-400">({count})</span>}
          </div>
          <button onClick={close} className="p-2 hover:bg-slate-100 rounded-xl">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-4xl">
              🛒
            </div>
            <p className="font-semibold text-slate-700">Tu carrito está vacío</p>
            <p className="text-sm text-slate-400 mt-1">¡Agrega pizzas y combos deliciosos!</p>
            <button
              onClick={close}
              className="mt-5 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-2xl"
            >
              Ver menú
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-slate-50 rounded-2xl p-3">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-slate-200" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm leading-tight">{item.name}</p>
                    <p className="text-sm font-bold text-orange-600 mt-0.5">
                      {formatCOP(item.price * item.qty)} COP
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => dec(item.id)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-semibold text-sm w-5 text-center">{item.qty}</span>
                      <button onClick={() => inc(item.id)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(item.id)} className="ml-auto p-1.5 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm">Total</span>
                <span className="font-bold text-xl text-slate-900">
                  {formatCOP(total)} <span className="text-sm font-normal text-slate-400">COP</span>
                </span>
              </div>
              <button
                onClick={goCheckout}
                className="w-full bg-orange-500 hover:bg-orange-600 transition-colors text-white font-bold py-3.5 rounded-2xl"
              >
                Finalizar pedido
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}