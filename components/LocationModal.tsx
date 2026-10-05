'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Check, LocateFixed, MapPin, Navigation, X } from 'lucide-react';

type LocationState = {
  city: string;
  region?: string;
  approximate?: boolean;
};

type LocationModalProps = {
  onLocationChange?: (location: LocationState | null) => void;
};

const STORAGE_KEY = 'delipizza-location';

function cityFromTimezone() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const cities: Record<string, string> = {
    'America/Bogota': 'Bogotá',
    'America/Medellin': 'Medellín',
    'America/Cali': 'Cali',
    'America/Barranquilla': 'Barranquilla',
    'America/Cartagena': 'Cartagena',
  };
  return cities[timezone] || 'tu ciudad';
}

export const LocationModal: React.FC<LocationModalProps> = ({ onLocationChange }) => {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<LocationState | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage?.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as LocationState;
        setLocation(parsed);
        onLocationChange?.(parsed);
      } else {
        const timer = window.setTimeout(() => setOpen(true), 650);
        return () => window.clearTimeout(timer);
      }
    } catch {
      setOpen(true);
    }
  }, [onLocationChange]);

  const saveLocation = useCallback((value: LocationState) => {
    setLocation(value);
    setOpen(false);
    onLocationChange?.(value);
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(value));
  }, [onLocationChange]);

  const detectLocation = useCallback(() => {
    setLoading(true);
    setError('');
    if (!navigator.geolocation) {
      saveLocation({ city: cityFromTimezone(), approximate: true });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}&zoom=10&accept-language=es-CO`,
          { headers: { Accept: 'application/json' } },
        );
        if (!response.ok) throw new Error('reverse-geocode');
        const data = await response.json();
        const address = data.address || {};
        const value = {
          city: address.city || address.town || address.municipality || address.village || cityFromTimezone(),
          region: address.state,
        };
        saveLocation(value);
      } catch {
        saveLocation({ city: cityFromTimezone(), approximate: true });
      } finally {
        setLoading(false);
      }
    }, () => {
      setLoading(false);
      setError('No pudimos acceder a tu ubicación automáticamente. Puedes continuar con la ciudad predeterminada.');
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }, [saveLocation]);

  const useApproximate = () => saveLocation({ city: cityFromTimezone(), approximate: true });

  return (
    <>
      {location && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-20 left-4 z-30 flex items-center gap-2 rounded-full border border-brand-primary/20 bg-surface-card/95 px-4 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-md transition hover:border-brand-primary/50"
          aria-label={`Zona de entrega: ${location.city}. Cambiar ubicación`}
        >
          <MapPin className="h-4 w-4 text-brand-primary" />
          <span>Entregando en <strong className="text-amber-300">{location.city}</strong></span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="location-title">
          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-white text-slate-900 shadow-2xl animate-fade-in">
            <div className="h-2 bg-gradient-to-r from-brand-primary via-red-500 to-amber-400" />
            <button type="button" onClick={useApproximate} className="absolute right-4 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Cerrar y continuar">
              <X className="h-5 w-5" />
            </button>
            <div className="p-7 sm:p-9 text-center">
              <img
                src="/brand/delipizza-emblem.png"
                alt="DeliPizza"
                className="h-16 w-16 object-contain mx-auto mb-3"
              />
              <p className="mb-2 text-center text-xs font-black uppercase tracking-[0.18em] text-brand-primary">DeliPizza Domicilios</p>
              <h2 id="location-title" className="text-center text-2xl font-black tracking-tight text-slate-900">¿Dónde te encuentras?</h2>
              <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-relaxed text-slate-500">Mostramos las ofertas, el tiempo de entrega y el domicilio disponible para tu zona.</p>

              <button type="button" onClick={detectLocation} disabled={loading} className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-red-200 transition hover:bg-brand-primary-hover disabled:cursor-wait disabled:opacity-70">
                <LocateFixed className={`h-5 w-5 ${loading ? 'animate-pulse' : ''}`} />
                {loading ? 'Detectando tu ubicación…' : 'Usar mi ubicación actual'}
              </button>
              <button type="button" onClick={useApproximate} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                <MapPin className="h-4 w-4 text-slate-400" />
                Continuar con {cityFromTimezone()}
              </button>
              {error && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-center text-xs font-medium leading-relaxed text-amber-800">{error}</p>}
              <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400"><Check className="h-3.5 w-3.5 text-emerald-500" /> Usamos tu ciudad para calcular la cobertura de entrega.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
