import { useEffect, useState } from 'react';
import { db } from '@/api/base44Client';
import ProductCard from '@/components/ProductCard';

export default function MenuSection({
  category,
  title,
  subtitle,
  icon,
  initialProducts = null,
  isSuperCombos = false,
  seconds = 25 * 60,
}) {
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    setLoading(true);
    db.entities.Product.filter({ category }, { limit: 50 })
      .then((res) => {
        setProducts(res.items || []);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [category, initialProducts]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <section id={category} className="scroll-mt-32 max-w-4xl mx-auto px-4 mt-8 mb-4">
      {/* Category Section Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic flex items-center gap-2">
          <span>{title}</span>
          {icon && <span>{icon}</span>}
        </h2>
        {subtitle && (
          <p className="text-red-600 font-bold italic text-sm mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-slate-200/70 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-slate-400 text-sm italic py-4">No hay productos disponibles en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p, idx) => (
            <ProductCard
              key={p.id}
              product={p}
              isHighlighted={isSuperCombos && idx < 2}
            />
          ))}
        </div>
      )}

      {/* Countdown Box for Super Combos Section in Spanish matching reference */}
      {isSuperCombos && (
        <div className="mt-8 bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100 max-w-xl mx-auto">
          <h3 className="text-red-600 font-black text-base sm:text-lg mb-3 tracking-tight uppercase">
            🔥 ¡La promoción de combos termina en:
          </h3>
          <div className="bg-red-600 text-white inline-block px-8 py-2.5 rounded-xl text-3xl sm:text-4xl font-black timer-box tracking-wider font-mono">
            {mm}:{ss}
          </div>
        </div>
      )}
    </section>
  );
}