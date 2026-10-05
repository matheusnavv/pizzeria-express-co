import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { siteConfig } from '@/config/siteConfig';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Pizzería Express | Pizza a domicilio',
  description:
    'Pide pizzas, combos, bebidas y acompañamientos a domicilio. Personaliza tu pizza, paga en línea y recibe tu pedido.',
  keywords: [
    'pizza colombia',
    'domicilio pizza',
    'super combos pizza',
    'pizza nequi',
    'pizza bre-b',
    'mitad y mitad pizza',
    'borde de queso y bocadillo',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Pizzería Express | Pizza a domicilio',
    description:
      'Pide pizzas, combos, bebidas y acompañamientos a domicilio. Personaliza tu pizza, paga en línea y recibe tu pedido.',
    type: 'website',
    locale: 'es_CO',
    siteName: siteConfig.brand.name,
    images: [
      {
        url: '/images/brand/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pizzería Express Colombia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pizzería Express | Pizza a domicilio',
    description:
      'Pide pizzas, combos, bebidas y acompañamientos a domicilio. Personaliza tu pizza, paga en línea y recibe tu pedido.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0B0F17',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html lang="es-CO" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        {/* Meta Pixel Code (Safely injected only if ID is configured) */}
        {pixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
