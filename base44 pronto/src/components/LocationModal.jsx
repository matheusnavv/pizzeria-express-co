import { useState } from 'react';
import { MapPin, Loader2, Navigation, Check, ChevronRight } from 'lucide-react';
import { db } from '@/api/base44Client';

const TOP_COLOMBIAN_CITIES = [
  'Bogotá',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Cartagena',
  'Bucaramanga',
  'Pereira',
];

export default function LocationModal({ onClose }) {
  const [status, setStatus] = useState('idle'); // idle | loading | detected | error
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [coords, setCoords] = useState(null);

  const detectLocation = () => {
    setStatus('loading');
    if (!navigator.geolocation) {
      fallbackIP();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`
          );
          const data = await res.json();
          const detectedCity =
            data.city || data.locality || data.principalSubdivision || 'Bogotá';
          const detectedState = data.principalSubdivision || '';
          setCity(detectedCity);
          setStateName(detectedState);
          setStatus('detected');
        } catch {
          fallbackIP();
        }
      },
      () => fallbackIP(),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const fallbackIP = async () => {
    try {
      const res = await fetch('https://ipwho.is/');
      const data = await res.json();
      if (data && data.success && data.city) {
        setCity(data.city);
        setStateName(data.region || '');
        setStatus('detected');
        return;
      }
    } catch (_) {}
    setCity('Bogotá');
    setStatus('detected');
  };

  const confirmCity = async (selectedCity) => {
    const finalCity = selectedCity || city || 'Bogotá';
    try {
      await db.entities.Lead.create({
        city: finalCity,
        state: stateName || 'Colombia',
        latitude: coords?.latitude || null,
        longitude: coords?.longitude || null,
      });
    } catch (_) {}
    localStorage.setItem('lead_city', finalCity);
    onClose(finalCity);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Modal Banner with Official Logo */}
        <div className="relative bg-gradient-to-br from-[#c62828] via-[#e53935] to-[#f97316] p-6 text-center text-white">
          <div className="w-20 h-20 mx-auto rounded-full bg-white p-2.5 shadow-lg border-2 border-white/80 mb-2 flex items-center justify-center">
            <img
              src="/delipizza-logo.png"
              alt="DeliPizza"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">DeliPizza Colombia</h2>
          <p className="text-xs text-white/90 font-medium mt-0.5">
            ¡Entrega express caliente a tu puerta!
          </p>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-extrabold text-slate-900 mb-1">
            ¿En qué ciudad te encuentras?
          </h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Identificamos tu zona para garantizar el tiempo de entrega de 25–30 min y envío gratis.
          </p>

          {status === 'detected' ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">
                    Ciudad detectada
                  </p>
                  <p className="text-base font-extrabold text-green-950">
                    {city} {stateName ? `· ${stateName}` : ''}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {status === 'loading' ? (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3.5 rounded-2xl opacity-90"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Detectando tu ubicación...</span>
            </button>
          ) : status === 'detected' ? (
            <button
              onClick={() => confirmCity(city)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold py-3.5 rounded-2xl shadow-md transition active:scale-95"
            >
              Confirmar {city} y ver menú
            </button>
          ) : (
            <button
              onClick={detectLocation}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-extrabold py-3.5 rounded-2xl shadow-md transition active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>Detectar mi ciudad automáticamente</span>
            </button>
          )}

          {/* Quick Colombian City Selector */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              O elige tu ciudad directamente:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TOP_COLOMBIAN_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => confirmCity(c)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-orange-50 hover:text-orange-700 text-slate-700 border border-slate-200/60 transition"
                >
                  <span className="truncate">{c}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
