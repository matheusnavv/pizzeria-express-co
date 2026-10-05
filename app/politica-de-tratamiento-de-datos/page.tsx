import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

export const metadata = {
  title: 'Política de Tratamiento de Datos Personales | DeliPizza',
  description: 'Conoce cómo tratamos y protegemos tus datos personales bajo la Ley 1581 de 2012 de la República de Colombia.',
};

export default function PoliticaDatosPage() {
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
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Legislación Colombiana — Ley 1581 de 2012</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Política de Tratamiento de Datos Personales
          </h1>
          <p className="text-xs text-neutral-400 mt-2">
            Última actualización: {new Date().toLocaleDateString('es-CO')}
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-neutral-300 space-y-6 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Identificación del Responsable del Tratamiento</h2>
            <p>
              El responsable del tratamiento de los datos personales recolectados a través de esta plataforma de comercio electrónico es{' '}
              <strong>{siteConfig.legal.companyName}</strong>, con NIT <strong>{siteConfig.legal.nit}</strong>, con domicilio en{' '}
              <strong>{siteConfig.legal.address}</strong>, y correo electrónico de contacto:{' '}
              <strong>{siteConfig.legal.email}</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Marco Normativo Aplicable</h2>
            <p>
              La presente política se rige de manera exclusiva por las disposiciones contenidas en la{' '}
              <strong>Ley Estatutaria 1581 de 2012</strong> de la República de Colombia, el{' '}
              <strong>Decreto Reglamentario 1377 de 2013</strong> (compilado en el Decreto Único Reglamentario 1074 de 2015) y demás normas que las modifiquen, adicionen o complementen, garantizando el derecho constitucional de Hábeas Data que tienen todas las personas a conocer, actualizar y rectificar la información que se haya recogido sobre ellas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Finalidades de la Recolección de Datos</h2>
            <p>Los datos solicitados a nuestros clientes (nombre completo, número de celular, departamento, ciudad, barrio, dirección de entrega y notas operativas) se recopilan estrictamente con las siguientes finalidades:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
              <li>Procesar, preparar, despachar y entregar los pedidos de alimentos solicitados a domicilio.</li>
              <li>Generar las instrucciones de pago a través de los proveedores oficiales autorizados (Nequi y Bre-B vía XPAG).</li>
              <li>Comunicar el estado de la orden o eventualidades logísticas relacionadas con la entrega.</li>
              <li>Cumplir con las obligaciones legales, tributarias y de facturación vigentes en Colombia.</li>
              <li>Atender peticiones, quejas, reclamos o solicitudes de garantía sobre los productos adquiridos.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Derechos de los Titulares de la Información</h2>
            <p>De conformidad con el artículo 8 de la Ley 1581 de 2012, el titular de los datos personales cuenta con los siguientes derechos:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
              <li>Conocer, actualizar y rectificar sus datos personales frente al Responsable del Tratamiento.</li>
              <li>Solicitar prueba de la autorización otorgada para el tratamiento de sus datos.</li>
              <li>Ser informado sobre el uso que se le ha dado a sus datos personales.</li>
              <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley.</li>
              <li>Revocar la autorización o solicitar la supresión del dato cuando no medie un deber legal o contractual de permanecer en la base de datos.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Canales para Ejercer los Derechos de Hábeas Data</h2>
            <p>
              El titular podrá ejercer sus derechos de consulta, actualización o supresión de datos remitiendo una solicitud formal al correo electrónico:{' '}
              <a href={`mailto:${siteConfig.legal.email}`} className="text-amber-400 underline">
                {siteConfig.legal.email}
              </a>
              , indicando su nombre completo, número de identificación y la descripción clara de su solicitud. Las solicitudes serán atendidas dentro de los términos establecidos en la Ley 1581 de 2012.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
