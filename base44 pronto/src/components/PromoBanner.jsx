import { Flame } from 'lucide-react';

export default function PromoBanner({ seconds = 25 * 60 }) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
  const remaining = String(seconds % 60).padStart(2, '0');

  return (
    <div className="bg-[#dc2626] text-white text-center py-2 px-3 text-xs font-black uppercase tracking-wider sticky top-0 z-50 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-2">
        <Flame className="w-4 h-4 text-yellow-300 animate-pulse shrink-0" />
        <span>
          ¡Promoción de combos termina en:{' '}
          <span className="font-mono bg-black/20 px-2 py-0.5 rounded ml-1 text-sm tracking-normal">
            {minutes}:{remaining}
          </span>
        </span>
      </div>
    </div>
  );
}
