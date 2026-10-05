export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-10 px-4 text-center mt-12">
      <div className="max-w-4xl mx-auto">
        {/* Official PNG Logo */}
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 bg-white rounded-full p-2 border border-slate-200 shadow-sm flex items-center justify-center">
            <img
              src="/delipizza-logo.png"
              alt="DeliPizza Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <h3 className="font-black text-xl text-[#006437] mb-1 uppercase italic tracking-tight">
          DeliPizza Colombia
        </h3>
        <p className="text-slate-500 text-xs sm:text-sm mb-6 font-medium">
          La auténtica pizza artesanal caliente en tu puerta en 25–30 minutos.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span className="hover:text-orange-600 cursor-pointer">Políticas de Privacidad</span>
          <span>|</span>
          <span className="hover:text-orange-600 cursor-pointer">Términos de Servicio</span>
          <span>|</span>
          <span className="hover:text-orange-600 cursor-pointer">Garantía de Entrega</span>
        </div>

        <div className="text-[11px] text-slate-400 uppercase tracking-wider space-y-1">
          <p>© 2026 DeliPizza Colombia. Todos los derechos reservados.</p>
          <p className="text-[10px] text-slate-400">Atención al cliente: domicilios en Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga y Pereira.</p>
        </div>
      </div>
    </footer>
  );
}
