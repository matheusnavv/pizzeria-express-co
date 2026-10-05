'use client';

import React, { useEffect, useState } from 'react';
import { siteConfig } from '@/config/siteConfig';

interface CountdownProps {
  customEndsAt?: string; // ISO date string if special promo
  prefixText?: string;
}

export const PromotionCountdown: React.FC<CountdownProps> = ({
  customEndsAt,
  prefixText = 'PEDIDOS DE HOY CIERRAN EN',
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    isExpired: boolean;
  }>({
    hours: '00',
    minutes: '00',
    seconds: '00',
    isExpired: false,
  });

  useEffect(() => {
    function calculate() {
      const now = new Date();

      let targetTime: Date;

      if (customEndsAt) {
        targetTime = new Date(customEndsAt);
      } else {
        // Calculate based on today's closing hour in Colombia schedule
        const dayOfWeek = now.getDay();
        const schedule = siteConfig.schedule.weekdays[dayOfWeek];
        const lastRange = schedule?.ranges?.[schedule.ranges.length - 1];

        targetTime = new Date(now);
        if (lastRange) {
          const [h, m] = lastRange.close.split(':').map(Number);
          targetTime.setHours(h, m, 0, 0);
          if (targetTime.getTime() <= now.getTime()) {
            // Already closed today, target tomorrow's close
            targetTime.setDate(targetTime.getDate() + 1);
          }
        } else {
          targetTime.setHours(23, 0, 0, 0);
        }
      }

      const diffMs = targetTime.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00', isExpired: true });
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
        isExpired: false,
      });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [customEndsAt]);

  return (
    <div className="inline-flex items-center gap-2 bg-black/40 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-medium text-amber-200 shadow-sm">
      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
      <span className="font-semibold tracking-wide text-amber-300">{prefixText}</span>
      <div
        suppressHydrationWarning
        className="font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/20 text-amber-100 tracking-wider"
      >
        {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
      </div>
    </div>
  );
};
