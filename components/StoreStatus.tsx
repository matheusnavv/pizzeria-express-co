'use client';

import React, { useEffect, useState } from 'react';
import { siteConfig } from '@/config/siteConfig';

export interface StoreStatusInfo {
  isOpen: boolean;
  statusText: string;
  badgeClass: string;
  closingTime?: string;
}

export function getStoreStatus(): StoreStatusInfo {
  const now = new Date();
  // Format current time in Colombia timezone (America/Bogota)
  const options: Intl.DateTimeFormatOptions = {
    timeZone: siteConfig.schedule.timezone,
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(now);

  const hourPart = parts.find((p) => p.type === 'hour')?.value || '12';
  const minutePart = parts.find((p) => p.type === 'minute')?.value || '00';
  const currentMinutes = parseInt(hourPart, 10) * 60 + parseInt(minutePart, 10);

  const dayOfWeek = now.getDay(); // 0 is Sunday
  const daySchedule = siteConfig.schedule.weekdays[dayOfWeek];

  if (!daySchedule || !daySchedule.isOpen) {
    return {
      isOpen: false,
      statusText: 'CERRADO',
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
  }

  for (const range of daySchedule.ranges) {
    const [openH, openM] = range.open.split(':').map(Number);
    const [closeH, closeM] = range.close.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
      const minutesUntilClose = closeMinutes - currentMinutes;
      if (minutesUntilClose <= 45) {
        return {
          isOpen: true,
          statusText: 'CERRAMOS PRONTO',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse',
          closingTime: range.close,
        };
      }
      return {
        isOpen: true,
        statusText: 'ABIERTO AHORA',
        badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        closingTime: range.close,
      };
    }
  }

  return {
    isOpen: false,
    statusText: 'CERRADO POR HOY',
    badgeClass: 'bg-slate-700/40 text-slate-400 border-slate-600/30',
  };
}

export const StoreStatusBadge: React.FC = () => {
  const [status, setStatus] = useState<StoreStatusInfo>({
    isOpen: true,
    statusText: 'ABIERTO AHORA',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  });

  useEffect(() => {
    setStatus(getStoreStatus());
    const interval = setInterval(() => {
      setStatus(getStoreStatus());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      suppressHydrationWarning
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.badgeClass}`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`w-2 h-2 rounded-full ${
          status.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
        }`}
      />
      <span>{status.statusText}</span>
    </div>
  );
};
