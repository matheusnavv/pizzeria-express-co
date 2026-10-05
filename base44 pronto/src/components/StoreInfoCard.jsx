import { Coins, MapPin, Navigation } from 'lucide-react';
import { formatCOP } from '@/lib/format';

export default function StoreInfoCard({ city, onOpenLocation }) {
  const deliveryCity = city || 'tu ciudad';

  return (
    <div className="bg-white px-4 pt-7 pb-6 rounded-b-[36px] shadow-sm border-b border-slate-100 text-center">
      {/* Official circular logo container matching reference */}
      <div className="flex justify-center mb-3">
        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden p-2 ring-2 ring-slate-100">
          <img
            src="/delipizza-logo.png"
            alt="Logo Oficial DeliPizza"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Store Title */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#006437] mb-2 tracking-tight">
        DeliPizza
      </h1>

      {/* Delivery time badge */}
      <div className="text-[#006437] font-bold text-sm mb-4 flex items-center justify-center gap-2">
        <span>Tiempo de Entrega</span>
        <span className="bg-green-100 px-2.5 py-0.5 rounded-full text-green-800 font-extrabold text-xs">
          25 – 30 min
        </span>
      </div>

      {/* Min order and free delivery */}
      <div className="flex flex-wrap justify-center items-center gap-2.5 text-sm font-semibold text-slate-700 border-t border-slate-100 pt-4 max-w-xl mx-auto">
        <span className="inline-flex items-center gap-1">
          <Coins className="w-4 h-4 text-amber-500" />
          Mínimo <b className="text-slate-900">{formatCOP(19900)} COP</b>
        </span>
        <span className="text-slate-300">•</span>
        <button
          onClick={onOpenLocation}
          className="text-green-700 font-bold hover:underline inline-flex items-center gap-1"
          title="Haga clic para cambiar de ciudad"
        >
          <span>Entrega Gratis para </span>
          <span className="underline decoration-dotted font-extrabold">{deliveryCity}</span>
        </button>
      </div>

      {/* Distance indication */}
      <div className="mt-3 flex justify-center">
        <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-4 py-1 rounded-full text-xs font-semibold">
          <Navigation className="w-3.5 h-3.5 text-red-500" />
          <span>Estamos a <b className="text-slate-900">1,6 km</b> de ti</span>
        </div>
      </div>

      {/* Pulsing Open Now badge */}
      <div className="mt-3.5 flex justify-center">
        <div className="bg-green-100 text-green-700 px-6 py-1.5 rounded-full text-xs font-black flex items-center gap-2 border border-green-200">
          <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse-fast" />
          ABIERTO AHORA
        </div>
      </div>
    </div>
  );
}
