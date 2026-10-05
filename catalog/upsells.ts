/**
 * Post-purchase upsell offer definitions.
 * Each offer is shown in sequence after the main payment is confirmed.
 * Set `enabled: false` to disable without removing the offer.
 *
 * RULE: Only add a real offer price when operationally justified.
 * Never fabricate savings that don't reflect a real price difference.
 */

export interface UpsellOffer {
  id: string;
  sequence: number; // 1-based display order
  enabled: boolean;
  productId: string; // Must exist in ALL_PRODUCTS
  title: string;
  subtitle: string;
  cta: string;
  offerPriceCOP: number; // Special price for upsell (must be < regularPriceCOP)
  regularPriceCOP: number; // Normal catalog price (for crossed-out display)
  savingsCOP: number; // Computed: regularPriceCOP - offerPriceCOP
  timerSeconds: number; // Session-scoped timer. 0 = no timer.
  image: string;
}

export const UPSELL_OFFERS: UpsellOffer[] = [
  {
    id: 'upsell-1-pizza-familiar',
    sequence: 1,
    enabled: true,
    productId: 'pizza-familiar',
    title: '🎁 Oferta exclusiva para tu pedido',
    subtitle: 'Agrega una Pizza Familiar (8 porciones) a precio especial ahora.',
    cta: 'AGREGAR POR',
    offerPriceCOP: 29900,
    regularPriceCOP: 36900,
    savingsCOP: 7000,
    timerSeconds: 300, // 5 minutes
    image: '/images/products/super-combo-3.webp',
  },
  {
    id: 'upsell-2-dulce',
    sequence: 2,
    enabled: true,
    productId: 'pizza-nutella',
    title: '🍫 ¿Algo dulce para cerrar?',
    subtitle: 'Pizza de Nutella personal (4 porciones) con precio especial solo ahora.',
    cta: 'AGREGAR POR',
    offerPriceCOP: 11900,
    regularPriceCOP: 14900,
    savingsCOP: 3000,
    timerSeconds: 240,
    image: '/images/products/pizza-nutella.webp',
  },
  {
    id: 'upsell-3-combo-bebida',
    sequence: 3,
    enabled: true,
    productId: 'pan-de-ajo-queso',
    title: '🧀 Ideal para acompañar',
    subtitle: 'Pan de Ajo con Queso (4 unidades) recién horneado.',
    cta: 'AGREGAR POR',
    offerPriceCOP: 5900,
    regularPriceCOP: 6900,
    savingsCOP: 1000,
    timerSeconds: 180,
    image: '/images/products/pan-de-ajo.webp',
  },
  {
    id: 'upsell-4-brownie',
    sequence: 4,
    enabled: true,
    productId: 'brownie-chocolate',
    title: '🍫 ¡El final perfecto!',
    subtitle: 'Brownie de Chocolate con centro fundido a precio especial.',
    cta: 'AGREGAR POR',
    offerPriceCOP: 5500,
    regularPriceCOP: 6900,
    savingsCOP: 1400,
    timerSeconds: 0,
    image: '/images/products/brownie.webp',
  },
];

export const ACTIVE_UPSELLS = UPSELL_OFFERS.filter((o) => o.enabled).sort(
  (a, b) => a.sequence - b.sequence
);

export function getUpsellBySequence(seq: number): UpsellOffer | undefined {
  return ACTIVE_UPSELLS.find((o) => o.sequence === seq);
}

/**
 * Order bump offers shown inside the checkout page before the payment button.
 * These are one-tap additions, no configurator needed.
 */
export interface OrderBumpOffer {
  id: string;
  productId: string;
  title: string;
  description: string;
  offerPriceCOP: number;
  regularPriceCOP?: number; // Optional crossed-out price
  image: string;
  badge?: string;
}

export const ORDER_BUMP_OFFERS: OrderBumpOffer[] = [
  {
    id: 'bump-coca-cola',
    productId: 'coca-cola-original-1-5l',
    title: 'Coca-Cola Original 1.5 L',
    description: 'Bien fría para acompañar tu pedido.',
    offerPriceCOP: 7900,
    image: '/images/products/coca-cola-original.webp',
    badge: 'INCLUIR',
  },
  {
    id: 'bump-brownie',
    productId: 'brownie-chocolate',
    title: 'Brownie de Chocolate',
    description: 'Centro fundido, nueces y chocolate.',
    offerPriceCOP: 6900,
    image: '/images/products/brownie.webp',
    badge: 'INCLUIR',
  },
  {
    id: 'bump-pan-ajo',
    productId: 'pan-de-ajo-queso',
    title: 'Pan de Ajo con Queso',
    description: '4 unidades horneadas al instante.',
    offerPriceCOP: 6900,
    image: '/images/products/pan-de-ajo.webp',
    badge: 'INCLUIR',
  },
  {
    id: 'bump-dedos-queso',
    productId: 'dedos-de-queso',
    title: 'Dedos de Queso',
    description: '6 unidades crocantes con queso fundido.',
    offerPriceCOP: 9900,
    image: '/images/products/dedos-de-queso.webp',
    badge: 'INCLUIR',
  },
];
