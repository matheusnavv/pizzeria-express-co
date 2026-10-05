import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

export const metadata = {
  title: 'Términos y Condiciones del Servicio | DeliPizza',
  description: 'Condiciones de uso, compra, entrega a domicilio y política de precios en Colombia.',
};

export default function TerminosCondicionesPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary pb-16">
      <header className="glass-nav border-b border-surface-border py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la tienda</span>
          </Link>
          <img src="/brand/delipizza-logo.png" alt="DeliPizza" className="h-7 w-auto object-contain" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="border-b border-surface-border pb-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <FileText className="w-4 h-4" />
            <span>Comercio Electrónico en Colombia</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Términos y Condiciones del Servicio
          </h1>
          <p className="text-xs text-neutral-400 mt-2">
            Rige las transacciones en territorio de la República de Colombia. Última actualización: {new Date().toLocaleDateString('es-CO')}
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-neutral-300 space-y-6 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Objeto y Generalidades</h2>
            <p>
              El presente documento regula el acceso, navegación y compra de productos alimenticios ofrecidos a través de este sitio web operado por{' '}
              <strong>{siteConfig.legal.companyName}</strong> (NIT {siteConfig.legal.nit}). Al confirmar un pedido en este sitio, el cliente manifiesta su aceptación plena y sin reservas de los presentes Términos y Condiciones.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Precios y Moneda Oficial</h2>
            <p>
              Todos los precios informados en este sitio web están expresados exclusivamente en{' '}
              <strong>Pesos Colombianos (COP)</strong>. Los precios corresponden a tarifas promocionales online fijadas para cada producto, combo, tamaño, borde relleno o ingrediente adicional según se indica en el catálogo. Se establece un pedido mínimo de compra de{' '}
              <strong>${siteConfig.commerce.minOrderCOP.toLocaleString('es-CO')} COP</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Servicio de Entrega a Domicilio y Cobertura</h2>
            <p>
              El servicio de entrega a domicilio se ofrece actualmente bajo la modalidad de{' '}
              <strong>Domicilio Gratis según cobertura</strong>. La disponibilidad del despacho está sujeta a la dirección informada por el cliente y a las condiciones operativas de movilidad y clima en la zona de entrega.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Medios de Pago Habilitados</h2>
            <p>
              El sitio cuenta con integración directa a pasarelas autorizadas para el mercado colombiano (XPAG), soportando transferencias inmediatas vía{' '}
              <strong>Nequi</strong> y pagos a través del sistema <strong>Bre-B</strong>. El pedido solo iniciará su preparación una vez que el sistema reciba la confirmación exitosa de la transacción financiera.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Productos Perecederos y Derecho de Retracto</h2>
            <p>
              De conformidad con lo dispuesto en el artículo 47, numeral 4 de la{' '}
              <strong>Ley 1480 de 2011 (Estatuto del Consumidor de Colombia)</strong>, se exceptúan del derecho de retracto los contratos de suministro de bienes que, por su naturaleza, sean perecederos o deban consumirse rápidamente, tales como pizzas, alimentos preparados y bebidas frías. Por lo anterior, una vez iniciada la preparación del pedido no habrá lugar a cancelaciones unilaterales o reembolsos injustificados.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">6. Garantía y Reclamaciones</h2>
            <p>
              En caso de que el pedido recibido presente inconformidades de calidad, discrepancias respecto a los sabores o ingredientes seleccionados, o daños atribuibles al transporte, el cliente deberá comunicarse dentro de los primeros 45 minutos tras la entrega al correo{' '}
              <a href={`mailto:${siteConfig.legal.email}`} className="text-amber-400 underline">
                {siteConfig.legal.email}
              </a>{' '}
              adjuntando evidencia fotográfica y el código del pedido (ej. {orderExample()}) para proceder a la reposición del producto o solución equivalente.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

function orderExample() {
  return 'PED-XXXXX';
}
