/**
 * Image Manifest and SVG Fallback Provider
 * See TODO_IMAGE_REPLACEMENT.md for details on replacing these assets with final photography.
 */

export interface ImageAssetMeta {
  path: string;
  alt: string;
  category: string;
  fallbackSvg: string;
}

function generatePlaceholderSvg(title: string, subtitle: string, bgColor = '#1e1e24', accentColor = '#E53935'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgColor}" />
        <stop offset="100%" stop-color="#121214" />
      </linearGradient>
    </defs>
    <rect width="400" height="400" rx="16" fill="url(#grad)" />
    <circle cx="200" cy="180" r="100" fill="${accentColor}" opacity="0.15" />
    <circle cx="200" cy="180" r="85" fill="none" stroke="${accentColor}" stroke-width="4" stroke-dasharray="8 6" opacity="0.4" />
    <text x="200" y="170" font-family="system-ui, -apple-system, sans-serif" font-size="48" text-anchor="middle" dominant-baseline="middle">🍕</text>
    <text x="200" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" fill="#F8FAFC" text-anchor="middle">${title}</text>
    <text x="200" y="270" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#94A3B8" text-anchor="middle">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const IMAGE_MANIFEST: Record<string, string> = {
  // Super Combos
  '/images/products/super-combo-1.webp': generatePlaceholderSvg('SUPER COMBO 1', '2 Personales + Gaseosa 1.5 L', '#2a1a1f', '#E53935'),
  '/images/products/super-combo-2.webp': generatePlaceholderSvg('SUPER COMBO 2', '2 Medianas + Gaseosa 1.5 L', '#2a1a1f', '#E53935'),
  '/images/products/super-combo-3.webp': generatePlaceholderSvg('SUPER COMBO 3', '2 Familiares + Gaseosa 1.5 L', '#2a1a1f', '#E53935'),
  '/images/products/super-combo-4.webp': generatePlaceholderSvg('SUPER COMBO 4', '2 Gigantes + Gaseosa 1.5 L', '#2a1a1f', '#E53935'),
  '/images/products/super-combo-5.webp': generatePlaceholderSvg('SUPER COMBO 5', '2 Extragrandes + 2 Gaseosas', '#3b1c1c', '#FFB300'),
  '/images/products/super-combo-6.webp': generatePlaceholderSvg('SUPER COMBO 6', '3 Extragrandes + 3 Gaseosas', '#3b1c1c', '#FFB300'),

  // Combos Especiales
  '/images/products/combo-especial-hawaiana.webp': generatePlaceholderSvg('COMBO HAWAIANA', 'Pizza Mediana + Gaseosa', '#252018', '#FFB300'),
  '/images/products/combo-especial-pepperoni.webp': generatePlaceholderSvg('COMBO PEPPERONI', 'Pizza Mediana + Gaseosa', '#2b1b1b', '#E53935'),
  '/images/products/combo-especial-pollo-champinones.webp': generatePlaceholderSvg('COMBO POLLO CHAMP.', 'Pizza Mediana + Gaseosa', '#20241e', '#43A047'),
  '/images/products/combo-especial-carnes.webp': generatePlaceholderSvg('COMBO CARNES', 'Pizza Mediana + Gaseosa', '#2b1b1b', '#E53935'),
  '/images/products/combo-especial-paisa.webp': generatePlaceholderSvg('COMBO PAISA', 'Pizza Mediana + Gaseosa', '#2b2216', '#FFB300'),
  '/images/products/combo-especial-jamon-queso.webp': generatePlaceholderSvg('COMBO JAMÓN Y QUESO', 'Pizza Mediana + Gaseosa', '#2b1e22', '#E53935'),

  // Flavors
  '/images/products/pizza-hawaiana.webp': generatePlaceholderSvg('HAWAIANA', 'Jamón, piña y queso', '#2a2118', '#FFB300'),
  '/images/products/pizza-pollo-champinones.webp': generatePlaceholderSvg('POLLO CHAMPIÑONES', 'Pollo tierno y champiñones', '#20241e', '#43A047'),
  '/images/products/pizza-pepperoni.webp': generatePlaceholderSvg('PEPPERONI', 'Pepperoni americano', '#2b1b1b', '#E53935'),
  '/images/products/pizza-jamon-queso.webp': generatePlaceholderSvg('JAMÓN Y QUESO', 'Jamón seleccionado', '#2b1e22', '#E53935'),
  '/images/products/pizza-carnes.webp': generatePlaceholderSvg('CARNES', 'Selección de carnes', '#2b1b1b', '#E53935'),
  '/images/products/pizza-criolla.webp': generatePlaceholderSvg('CRIOLLA', 'Carne desmechada y maíz', '#2b2216', '#FFB300'),
  '/images/products/pizza-paisa.webp': generatePlaceholderSvg('PAISA', 'Chorizo, jamón y maíz', '#2b2216', '#FFB300'),
  '/images/products/pizza-pollo-tocineta.webp': generatePlaceholderSvg('POLLO TOCINETA', 'Pollo, tocineta y maíz', '#2b1b1b', '#E53935'),
  '/images/products/pizza-miel-mostaza.webp': generatePlaceholderSvg('MIEL MOSTAZA', 'Pollo y salsa miel mostaza', '#2a2416', '#FFB300'),
  '/images/products/pizza-vegetariana.webp': generatePlaceholderSvg('VEGETARIANA', 'Champiñones y vegetales', '#1b261e', '#43A047'),

  // Crusts
  '/images/crusts/borde-tradicional.webp': generatePlaceholderSvg('BORDE TRADICIONAL', 'Masa artesanal', '#222222', '#888888'),
  '/images/crusts/borde-queso.webp': generatePlaceholderSvg('BORDE DE QUESO', 'Mozzarella fundido', '#2a2216', '#FFB300'),
  '/images/crusts/borde-queso-bocadillo.webp': generatePlaceholderSvg('QUESO Y BOCADILLO', 'Queso y guayaba veleña', '#2a1a24', '#E53935'),

  // Sides
  '/images/products/pan-de-ajo.webp': generatePlaceholderSvg('PAN DE AJO', '4 unidades gratinadas', '#26221a', '#FFB300'),
  '/images/products/dedos-de-queso.webp': generatePlaceholderSvg('DEDOS DE QUESO', '6 unidades crocantes', '#26221a', '#FFB300'),
  '/images/products/papas-a-la-francesa.webp': generatePlaceholderSvg('PAPAS FRANCESAS', 'Porción dorada', '#26221a', '#FFB300'),

  // Desserts
  '/images/products/pizza-arequipe-queso.webp': generatePlaceholderSvg('AREQUIPE Y QUESO', 'Personal · 4 porciones', '#2b2014', '#D97706'),
  '/images/products/pizza-bocadillo-queso.webp': generatePlaceholderSvg('BOCADILLO Y QUESO', 'Personal · 4 porciones', '#2b1620', '#DC2626'),
  '/images/products/pizza-nutella.webp': generatePlaceholderSvg('PIZZA DE NUTELLA', 'Personal · 4 porciones', '#241a18', '#78350F'),
  '/images/products/brownie.webp': generatePlaceholderSvg('BROWNIE CHOCOLATE', '1 unidad con nueces', '#241a18', '#78350F'),

  // Drinks
  '/images/products/coca-cola-original.webp': generatePlaceholderSvg('COCA-COLA 1.5 L', 'Sabor Original Fría', '#2b1414', '#E53935'),
  '/images/products/coca-cola-zero.webp': generatePlaceholderSvg('COCA-COLA ZERO 1.5 L', 'Sin Azúcar Fría', '#1e1e1e', '#666666'),
  '/images/products/colombiana-postobon.webp': generatePlaceholderSvg('COLOMBIANA 1.5 L', 'La Nuestra · Postobón', '#2b1c14', '#EA580C'),
  '/images/products/manzana-postobon.webp': generatePlaceholderSvg('MANZANA POSTOBÓN 1.5 L', 'Sabor a Manzana', '#2b141e', '#E11D48'),
};

/**
 * Returns either the asset path or the immediate SVG placeholder
 */
export function getProductImage(path: string): string {
  return IMAGE_MANIFEST[path] || generatePlaceholderSvg('Pizzería Express', 'Pizza Artesanal');
}
