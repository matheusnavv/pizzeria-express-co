import { MapPin, Clock, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { formatCOP } from '@/lib/format';

export default function Header({ city, onOpenCart, onOpenLocation }) {
  const { count, total } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand with official logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 shrink-0 text-left group focus:outline-none"
          title="DeliPizza Home"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm p-1 flex items-center justify-center overflow-hidden">
            <img
              src="/delipizza-logo.png"
              alt="DeliPizza"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <p className="font-extrabold text-slate-900 text-base leading-tight tracking-tight group-hover:text-orange-600 transition-colors">
              DeliPizza
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Delivery Express
            </p>
          </div>
        </button>

        {/* Location & delivery info */}
        <button
          onClick={onOpenLocation}
          className="hidden sm:flex flex-col items-start px-3 py-1 rounded-xl hover:bg-slate-50 transition text-left"
          title="Cambiar ubicación"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="truncate max-w-[140px]">{city || 'Detectando ciudad...'}</span>
            <span className="text-[10px] text-slate-400 font-normal underline">cambiar</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>25–30 min</span>
            <span className="text-green-600 font-bold">• Abierto</span>
          </div>
        </button>

        {/* Cart button */}
        <button
          onClick={onOpenCart}
          className="relative flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl px-3.5 py-2 transition-all shadow-md active:scale-95"
        >
          <ShoppingBag className="w-4 h-4" />
          <div className="text-left text-xs font-bold leading-tight hidden xs:block sm:block">
            <span>{count > 0 ? `${count} item${count > 1 ? 's' : ''}` : 'Carrito'}</span>
            {count > 0 && <span className="block text-[10px] opacity-90">{formatCOP(total)} COP</span>}
          </div>
          {count > 0 && (
            <span className="xs:hidden sm:hidden bg-white text-orange-600 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
