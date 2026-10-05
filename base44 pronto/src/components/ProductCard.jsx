import { Plus, Star, Check, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { formatCOP } from '@/lib/format';

export default function ProductCard({ product, isHighlighted = false }) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

  const handleCardClick = () => {
    if (product.hasSizes && product.sizes && product.sizes.length > 0) {
      setShowSizeModal(true);
    } else {
      add(product);
      triggerAdded();
    }
  };

  const handleSizeSelect = (sizeOpt, e) => {
    e.stopPropagation();
    add({
      ...product,
      id: sizeOpt.id || `${product.id}-${sizeOpt.label}`,
      name: sizeOpt.name || `${product.name} (${sizeOpt.label})`,
      price: sizeOpt.price,
      serves: sizeOpt.label,
    });
    setShowSizeModal(false);
    triggerAdded();
  };

  const triggerAdded = () => {
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`bg-white p-3.5 rounded-2xl flex gap-3.5 card-shadow cursor-pointer transition-all duration-200 relative overflow-hidden border ${
          isHighlighted
            ? 'animate-card-pulse border-orange-500 shadow-md'
            : 'border-slate-100 hover:border-orange-200 hover:shadow-md active:scale-[0.98]'
        }`}
      >
        {/* Corner Badge */}
        {product.badge && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-tight shadow-sm z-10">
            {product.badge}
          </div>
        )}

        {/* Product Image */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-slate-100 relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
          {product.rating > 0 && (
            <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-yellow-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
              <span>{product.rating}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between min-w-0 pr-1">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug line-clamp-2">
              {product.name}
            </h3>

            {/* Quick metadata line */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {product.serves && (
                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {product.serves}
                </span>
              )}
              {product.hasSoda && (
                <span className="bg-red-50 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-red-100">
                  + Gaseosa 1.5 L
                </span>
              )}
              {product.hasSizes && (
                <span className="bg-amber-50 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-200">
                  Elige 4 u 8 pedazos
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Price & Action Button */}
          <div className="flex items-end justify-between pt-2 border-t border-slate-50 mt-2">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                {product.priceLabel || 'PRECIO'}
              </span>
              <span className="font-black text-base sm:text-lg text-slate-900 leading-none">
                {formatCOP(product.price)}{' '}
                <span className="text-[11px] font-bold text-slate-500">COP</span>
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              aria-label={`Agregar ${product.name} al carrito`}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-md ${
                justAdded
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {justAdded ? (
                <Check className="w-5 h-5 animate-in zoom-in" />
              ) : product.hasSizes ? (
                <ChevronDown className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Plus className="w-5 h-5 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal / Sheet for choosing Dessert Pizza Size */}
      {showSizeModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowSizeModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Elige el tamaño</p>
                <h4 className="font-extrabold text-slate-900 text-base">{product.name}</h4>
              </div>
              <button
                onClick={() => setShowSizeModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {product.sizes.map((s, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleSizeSelect(s, e)}
                  className="w-full p-3.5 rounded-2xl border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 flex items-center justify-between transition-all group text-left"
                >
                  <div>
                    <p className="font-extrabold text-slate-900 group-hover:text-orange-600 text-sm">
                      {s.label}
                    </p>
                    <p className="text-xs text-slate-400">Recién horneada para disfrutar</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 text-base">
                      {formatCOP(s.price)}
                    </span>
                    <span className="text-[10px] block text-slate-400 font-bold">COP</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
