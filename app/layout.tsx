import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { siteConfig } from '@/config/siteConfig';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'DeliPizza | Domicilios de Pizza Online en Colombia',
  description:
    'Pide deliciosas pizzas recién horneadas, super combos familiares, bebidas y postres a domicilio en Colombia con DeliPizza. Paga fácil con Nequi o Bre-B.',
  keywords: [
    'delipizza',
    'delipizza colombia',
    'domicilio pizza',
    'super combos pizza',
    'pizza nequi',
    'pizza bre-b',
    'mitad y mitad pizza',
    'borde de queso',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  icons: {
    icon: '/brand/delipizza-emblem.png',
    apple: '/brand/delipizza-emblem.png',
  },
  openGraph: {
    title: 'DeliPizza | Domicilios de Pizza Online en Colombia',
    description:
      'Pide deliciosas pizzas recién horneadas, super combos familiares, bebidas y postres a domicilio en Colombia con DeliPizza. Paga fácil con Nequi o Bre-B.',
    type: 'website',
    locale: 'es_CO',
    siteName: 'DeliPizza',
    images: [
      {
        url: '/brand/delipizza-logo.png',
        width: 800,
        height: 400,
        alt: 'DeliPizza Colombia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeliPizza | Domicilios de Pizza Online en Colombia',
    description:
      'Pide deliciosas pizzas recién horneadas, super combos familiares, bebidas y postres a domicilio en Colombia con DeliPizza.',
    images: ['/brand/delipizza-logo.png'],
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
