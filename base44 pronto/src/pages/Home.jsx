import { useEffect, useState } from 'react';
import PromoBanner from '@/components/PromoBanner';
import Header from '@/components/Header';
import StoreInfoCard from '@/components/StoreInfoCard';
import CategoryBar from '@/components/CategoryBar';
import MenuSection from '@/components/MenuSection';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import LocationModal from '@/components/LocationModal';
import PurchaseAlerts from '@/components/PurchaseAlerts';
import { useCart } from '@/context/CartContext';
import { formatCOP } from '@/lib/format';
import { PRODUCTS, CATEGORIES_ORDER } from '@/lib/products';
import { Star, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Home() {
  const [city, setCity] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('super-combos');
  const [seconds, setSeconds] = useState(25 * 60);
  const { open, add, count, total } = useCart();

  // 25-minute countdown timer synchronized across the page
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 25 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check saved city lead or open modal
  useEffect(() => {
    const saved = localStorage.getItem('lead_city');
    if (saved) {
      setCity(saved);
    } else {
      setShowLocationModal(true);
    }
  }, []);

  // Intersection observer to track which category section is currently in view
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      for (const cat of CATEGORIES_ORDER) {
        const el = document.getElementById(cat.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveCategory(cat.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLocationClose = (detectedCity) => {
    if (detectedCity) setCity(detectedCity);
    setShowLocationModal(false);
  };

  // Find hero offer product (combo-5)
  const heroProduct = PRODUCTS.find((p) => p.id === 'combo-5') || PRODUCTS[0];

  const handleHeroOrder = () => {
    add(heroProduct);
    open();
  };

  // Group products by category
  const productsByCategory = {
    'super-combos': PRODUCTS.filter((p) => p.category === 'super-combos'),
    'combos-especiales': PRODUCTS.filter((p) => p.category === 'combos-especiales'),
    'pizzas': PRODUCTS.filter((p) => p.category === 'pizzas'),
    'bebidas': PRODUCTS.filter((p) => p.category === 'bebidas'),
    'postres': PRODUCTS.filter((p) => p.category === 'postres'),
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-28 selection:bg-orange-500 selection:text-white">
      {/* Location Modal */}
      {showLocationModal && <LocationModal onClose={handleLocationClose} />}

      {/* Top Urgency Countdown Banner */}
      <PromoBanner seconds={seconds} />

      {/* Navigation Header */}
      <Header
        city={city}
        onOpenCart={open}
        onOpenLocation={() => setShowLocationModal(true)}
      />

      {/* First Fold: Store Info Card */}
      <StoreInfoCard
        city={city}
        onOpenLocation={() => setShowLocationModal(true)}
      />

      {/* Clean, Non-Overflowing Hero Offer Box */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-600 to-orange-500 p-6 sm:p-8 text-white shadow-xl border border-red-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Offer details */}
            <div className="flex-1 max-w-lg">
              <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow-sm">
                🔥 OFERTA PRINCIPAL DEL DÍA
              </div>
              <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                {heroProduct.name}
              </h2>
              <p className="text-white/95 text-xs sm:text-sm mt-2 font-medium leading-relaxed">
                {heroProduct.description}
              </p>

              <div className="mt-4 flex flex-wrap items-baseline gap-2.5">
                <span className="text-3xl sm:text-4xl font-black">
                  {formatCOP(heroProduct.price)}
                </span>
                <span className="text-sm font-bold opacity-90 uppercase">COP</span>
                <span className="line-through text-white/60 text-sm font-semibold ml-1">
                  {formatCOP(83900)} COP
                </span>
                <span className="bg-white/20 text-yellow-300 text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                  Ahorras 25%
                </span>
              </div>

              <p className="text-xs font-bold text-yellow-200 mt-2">
                ✓ Domicilio gratis en {city || 'tu ciudad'} · Entrega en 25–30 min
              </p>

              <button
                onClick={handleHeroOrder}
                className="mt-5 inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-white text-red-700 hover:bg-yellow-300 hover:text-red-900 transition-all font-black px-7 py-3.5 rounded-2xl shadow-lg active:scale-95 text-sm uppercase tracking-wider"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Pedir este combo ahora</span>
              </button>
            </div>

            {/* Product image thumbnail contained cleanly */}
            <div className="w-44 h-44 sm:w-52 sm:h-52 shrink-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-black/10">
              <img
                src={heroProduct.image}
                alt={heroProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Category Navigation Bar */}
      <CategoryBar
        active={activeCategory}
        onSelect={(catId) => setActiveCategory(catId)}
      />

      {/* SEQUENTIAL CATALOG SECTIONS */}
      <main>
        {/* 1. Super Combos */}
        <MenuSection
          category="super-combos"
          title="Super Combos"
          subtitle="Los favoritos de todos · Sabores a elección"
          icon="🍕"
          initialProducts={productsByCategory['super-combos']}
          isSuperCombos={true}
          seconds={seconds}
        />

        {/* 2. Combos Especiales */}
        <MenuSection
          category="combos-especiales"
          title="Combos Especiales"
          subtitle="1 Pizza Mediana + Gaseosa 1.5 L"
          icon="⭐"
          initialProducts={productsByCategory['combos-especiales']}
          isSuperCombos={false}
        />

        {/* 3. Pizzas (8 porciones familiares) */}
        <MenuSection
          category="pizzas"
          title="Pizzas Familiares (8 porciones)"
          subtitle="Masa artesanal crujiente y abundante queso mozzarella"
          icon="🍕"
          initialProducts={productsByCategory['pizzas']}
          isSuperCombos={false}
        />

        {/* 4. Bebidas */}
        <MenuSection
          category="bebidas"
          title="Bebidas"
          subtitle="Gaseosas frías para acompañar"
          icon="🥤"
          initialProducts={productsByCategory['bebidas']}
          isSuperCombos={false}
        />

        {/* 5. Postres */}
        <MenuSection
          category="postres"
          title="Postres"
          subtitle="El toque dulce para compartir en casa"
          icon="🍰"
          initialProducts={productsByCategory['postres']}
          isSuperCombos={false}
        />
      </main>

      {/* Premium Trust Box from site-referencia */}
      <section className="max-w-4xl mx-auto px-4 mt-12">
        <div className="premium-box rounded-3xl p-8 text-center text-white shadow-xl">
          <p className="text-yellow-400 font-extrabold tracking-[0.3em] text-xs uppercase mb-2">
            PREMIUM QUALITY
          </p>
          <h2 className="text-2xl sm:text-3xl font-black mb-1 italic tracking-tight">
            MEJOR PIZZERÍA
          </h2>
          <p className="text-base sm:text-lg font-light tracking-widest mb-4">
            2025 / 2026
          </p>
          <div className="flex justify-center gap-1.5 text-2xl text-yellow-400">
            <Star className="w-6 h-6 fill-yellow-400" />
            <Star className="w-6 h-6 fill-yellow-400" />
            <Star className="w-6 h-6 fill-yellow-400" />
            <Star className="w-6 h-6 fill-yellow-400" />
            <Star className="w-6 h-6 fill-yellow-400" />
          </div>
        </div>
      </section>

      {/* Featured Family Box */}
      <section className="max-w-4xl mx-auto px-4 mt-10">
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 card-shadow">
          <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-slate-100 overflow-hidden">
            <img
              src="/images/caixa.webp"
              alt="Promoción Especial DeliPizza"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-5 text-center">
            <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight mb-1">
              ¡Pide hoy y recibe en 25–30 minutos!
            </h3>
            <p className="text-slate-600 font-medium italic text-sm">
              ¡Aprovecha los mejores combos de DeliPizza para compartir en familia con envío gratis en {city || 'tu zona'}!
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials dynamically bound to lead's city */}
      <Testimonials city={city} />

      {/* Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Live Social Proof / Order Popups */}
      <PurchaseAlerts city={city} />

      {/* PROMINENT STICKY FLOATING CART BAR (Solves: "O carrinho está ficando escondido") */}
      {count > 0 && (
        <div className="fixed bottom-4 inset-x-0 z-[80] px-4 flex justify-center animate-in slide-in-from-bottom duration-300">
          <button
            onClick={open}
            className="w-full max-w-lg bg-gradient-to-r from-red-600 via-orange-500 to-red-600 hover:from-red-700 hover:to-orange-600 text-white rounded-full p-3.5 sm:p-4 shadow-2xl flex items-center justify-between gap-3 border-2 border-white/40 active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white text-red-600 font-black flex items-center justify-center text-sm shrink-0 shadow-sm">
                {count}
              </div>
              <div className="text-left leading-tight truncate">
                <p className="font-extrabold text-sm sm:text-base tracking-tight">Ver mi pedido</p>
                <p className="text-[11px] text-white/90 font-medium">Envío gratis incluido</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-black text-base sm:text-lg">
                {formatCOP(total)} COP
              </span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
