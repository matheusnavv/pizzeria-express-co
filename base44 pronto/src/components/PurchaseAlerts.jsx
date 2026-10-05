import { useEffect, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { db } from '@/api/base44Client';
import { formatCOP } from '@/lib/format';

const COLOMBIAN_NAMES = [
  'Valentina Martínez',
  'Santiago Rodríguez',
  'Mariana Gómez',
  'Sebastián López',
  'Isabella Torres',
  'Mateo Ramírez',
  'Daniela Vargas',
  'Andrés González',
  'Laura Pérez',
  'Juan David Morales',
  'Camila Rojas',
  'Felipe Moreno',
  'Sofía Castro',
  'Nicolás Herrera',
];

const COLOMBIAN_CITIES = [
  'Bogotá',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Cartagena',
  'Bucaramanga',
  'Pereira',
];

const DEMO_ITEMS = [
  { item: '2 Pizzas Extragrandes + 2 Gaseosas', price: 62900, img: '/images/combo-duplo-cocacola.jpg' },
  { item: 'Pizza Mediana Pepperoni + Gaseosa 1.5 L', price: 31900, img: '/images/pizza-pepperoni.jpg' },
  { item: '2 Pizzas Familiares + 1 Gaseosa', price: 42900, img: '/images/pizzafoto.jpg' },
  { item: 'Pizza Mediana Hawaiana + Gaseosa 1.5 L', price: 31900, img: '/images/pizza-hawaiana.jpg' },
  { item: 'Pizza Personal Pollo Champiñones', price: 15900, img: '/images/frango.webp' },
  { item: 'Pizza Mediana Paisa + Gaseosa 1.5 L', price: 31900, img: '/images/carnedesol.webp' },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function PurchaseAlerts({ city }) {
  const [alert, setAlert] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeoutShow, timeoutHide;

    const showNext = async () => {
      let candidate = null;
      let isRealOrder = false;

      // Try reading recent real orders from db.entities.Order
      try {
        const orderRes = await db.entities.Order.filter();
        if (orderRes && orderRes.items && orderRes.items.length > 0) {
          const realOrder = pick(orderRes.items);
          const firstItem = (realOrder.items && realOrder.items[0]) || { name: 'Super Combo DeliPizza' };
          candidate = {
            name: realOrder.customer_name || 'Cliente DeliPizza',
            item: firstItem.name,
            price: realOrder.total || 62900,
            city: realOrder.city || city || 'Bogotá',
            img: '/images/combo-duplo-cocacola.jpg',
            time: 'hace unos minutos',
            isReal: true,
          };
          isRealOrder = true;
        }
      } catch (_) {}

      // Fallback: recent demonstration activity with Colombian profile
      if (!candidate) {
        const demo = pick(DEMO_ITEMS);
        candidate = {
          name: pick(COLOMBIAN_NAMES),
          item: demo.item,
          price: demo.price,
          city: city || pick(COLOMBIAN_CITIES),
          img: demo.img,
          time: `hace ${Math.floor(Math.random() * 6) + 1} min`,
          isReal: false,
        };
      }

      setAlert(candidate);
      setVisible(true);

      timeoutHide = setTimeout(() => {
        setVisible(false);
        timeoutShow = setTimeout(showNext, 12000 + Math.random() * 8000);
      }, 6000);
    };

    timeoutShow = setTimeout(showNext, 4000);

    return () => {
      clearTimeout(timeoutShow);
      clearTimeout(timeoutHide);
    };
  }, [city]);

  if (!alert) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-[360px] z-[95] transition-all duration-500 transform ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.18)] border border-slate-100 p-3 flex items-center gap-3">
        {/* Thumbnail with pulsing indicator */}
        <div className="relative shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
          <img
            src={alert.img}
            alt={alert.item}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-black text-green-700 uppercase tracking-wider flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {alert.isReal ? 'Pedido Confirmado' : 'Pedido Reciente'}
            </span>
            <span className="text-[11px] font-extrabold text-white bg-[#006437] px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
              {formatCOP(alert.price)} COP
            </span>
          </div>

          <h4 className="text-[13px] font-extrabold text-slate-900 truncate leading-snug">
            {alert.name} de {alert.city}
          </h4>
          <p className="text-[11px] text-slate-600 truncate">{alert.item}</p>

          <div className="flex items-center text-[10px] text-slate-400 font-bold italic mt-0.5">
            <MapPin className="w-3 h-3 text-red-500 mr-1 shrink-0" />
            <span>Cerca de ti</span>
            <span className="mx-1">•</span>
            <span>{alert.time}</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-slate-300 hover:text-slate-500 p-1"
          aria-label="Cerrar notificación"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
