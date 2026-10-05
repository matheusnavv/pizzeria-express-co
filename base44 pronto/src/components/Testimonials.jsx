import { Star } from 'lucide-react';

const TESTIMONIALS_DATA = [
  {
    name: 'Carolina M.',
    text: 'Masa crocante y abundante queso. ¡La mejor pizza a domicilio que he probado en años!',
    image: '/images/dep1.webp',
    rating: 5,
  },
  {
    name: 'Juan Felipe S.',
    text: 'Ingredientes de primera calidad. El combo familiar llegó en 22 minutos, humeante y perfecto.',
    image: '/images/dep07.webp',
    rating: 5,
  },
  {
    name: 'Valentina R.',
    text: 'Siempre pedimos el fin de semana para ver partidos. Las gaseosas bien frías y las pizzas calientes.',
    image: '/images/dep10.webp',
    rating: 5,
  },
  {
    name: 'Andrés P.',
    text: 'Excelente relación calidad-precio en Colombia. 100% recomendados, ya somos clientes fieles.',
    image: '/images/dep20.webp',
    rating: 5,
  },
  {
    name: 'Daniela G.',
    text: 'La pizza de arequipe con queso de postre es un espectáculo total. Atención diez de diez.',
    image: '/images/dep06.webp',
    rating: 5,
  },
  {
    name: 'Camilo V.',
    text: 'Pedimos para una reunión de 8 personas los combos extragrandes y rindió de maravilla.',
    image: '/images/dep1.webp',
    rating: 5,
  },
];

export default function Testimonials({ city = 'Bogotá' }) {
  const currentCity = city || 'Bogotá';

  return (
    <section className="max-w-4xl mx-auto px-4 mt-12 mb-8">
      <div className="text-center mb-6">
        <h3 className="font-extrabold text-slate-800 text-xl md:text-2xl uppercase tracking-tight">
          Lo que dicen nuestros clientes en {currentCity}
        </h3>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          Más de 14.000 pedidos entregados con 5 estrellas en {currentCity}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TESTIMONIALS_DATA.map((t, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-full h-36 bg-slate-100 rounded-xl overflow-hidden mb-3">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* 5 Stars */}
              <div className="flex text-amber-400 gap-0.5 mb-2">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-slate-600 text-xs sm:text-sm italic leading-relaxed">
                "{t.text}"
              </p>
            </div>

            <p className="text-[11px] font-bold text-slate-800 mt-3 pt-2 border-t border-slate-50">
              {t.name} · {currentCity}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}