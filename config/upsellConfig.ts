/**
 * SINGLE SOURCE OF TRUTH for the post-payment upsell funnel.
 *
 * Funnel sequence (mirrors backup):
 *   PAYMENT CONFIRMED
 *   → /upsell-combo   (2 Giant Pizzas + 2 Drinks — big ticket offer)
 *   → /oferta/1       (UP1: additional charge — "taxa de corrección de ruta" adapted)
 *   → /oferta/2       (UP2: additional charge — "manipulación y transporte")
 *   → /oferta/3       (UP3: service fee — animated service screen)
 *   → /oferta/4       (UP4: delivery partner — motoboy-style animation)
 *   → /pedido/[code]  (final confirmation)
 *
 * Each offer creates a SEPARATE PaymentTransaction linked to the same Order.
 * No new customer data is collected. No new address is needed.
 *
 * To disable an offer, set enabled: false — it will be skipped in the sequence.
 * The next enabled offer will be shown instead.
 */

export interface UpsellOfferConfig {
  /** Unique machine-readable ID */
  id: string;
  /** URL path segment, e.g. "upsell-combo", "up1", "up2", "up3", "up4" */
  slug: string;
  /** 1-based position in sequence */
  sequence: number;
  /** Whether this offer is active */
  enabled: boolean;
  /** Title shown on the offer page */
  title: string;
  /** Short subtitle / description */
  subtitle: string;
  /** Label shown in the main CTA button (before the price) */
  ctaLabel: string;
  /** Price charged in COP (sent to XPAG) */
  priceCOP: number;
  /** Reference price for crossed-out display */
  compareAtPriceCOP?: number;
  /** Percentage discount calculated from compareAt */
  discountPercent?: number;
  /** Savings in COP */
  savingsCOP?: number;
  /** Initial or current stock remaining */
  stockRemaining?: number;
  /** Line item name sent to XPAG */
  lineItemName: string;
  /** Session timer in seconds. 0 = no timer. */
  timerSeconds: number;
  /** Path to navigate to if accepted AND paid */
  onAcceptPath: string;
  /** Path to navigate to if declined */
  onDeclinePath: string;
  /** Image for the offer card */
  image: string;
  /** Badge text, e.g. "OFERTA EXCLUSIVA" */
  badge?: string;
  /** Testimonials shown on this page (optional) */
  testimonials?: Array<{ name: string; text: string }>;
}

// ── The funnel ─────────────────────────────────────────────────────────────

export const UPSELL_COMBO_CONFIG: UpsellOfferConfig = {
  id: 'upsell-combo',
  slug: 'upsell-combo',
  sequence: 0,
  enabled: true,
  title: '🎁 OFERTA EXCLUSIVA — SOLO POR HOY',
  subtitle: 'Agrega 2 Pizzas Gigantes (10 porciones c/u) + 2 Gaseosas 1.5 L a tu pedido',
  ctaLabel: 'QUIERO POR',
  priceCOP: 69900,
  compareAtPriceCOP: 111800,
  discountPercent: 37,
  savingsCOP: 41900,
  stockRemaining: 3,
  lineItemName: 'Super Combo Gigante Exclusivo',
  timerSeconds: 300, // 5 minutes persistent timer
  onAcceptPath: '/up1',
  onDeclinePath: '/up1',
  image: '/images/combo-duplo-cocacola.jpg',
  badge: 'OFERTA EXCLUSIVA',
  testimonials: [
    { name: 'Valentina R. · Bogotá', text: '"¡Pedí el combo gigante y llegó en 25 minutos! Súper recomendado."' },
    { name: 'Andrés M. · Medellín', text: '"Masa crocante, queso abundante y las gaseosas bien frías. Vale totalmente la pena."' },
  ],
};

export const OFERTA_1_CONFIG: UpsellOfferConfig = {
  id: 'oferta-1',
  slug: 'up1',
  sequence: 1,
  enabled: true,
  title: 'Ajuste de Ruta y Despacho Prioritario',
  subtitle: 'Para confirmar la prioridad inmediata de tu pedido en el sistema logístico de despacho, aplica un ajuste de ruta preferencial.',
  ctaLabel: 'CONFIRMAR POR',
  priceCOP: 14900,
  compareAtPriceCOP: 24900,
  lineItemName: 'Ajuste de Ruta Prioritaria',
  timerSeconds: 600,
  onAcceptPath: '/up2',
  onDeclinePath: '/up2',
  image: '/images/combo-familiar.jpg',
  badge: 'ETAPA 1 DE 4',
};

export const OFERTA_2_CONFIG: UpsellOfferConfig = {
  id: 'oferta-2',
  slug: 'up2',
  sequence: 2,
  enabled: true,
  title: 'Tasa de Manejo y Transporte Seguro (TMT)',
  subtitle: 'Garantiza la cadena de temperatura óptima y el embalaje térmico sellado de tus pizzas durante el trayecto hacia tu dirección.',
  ctaLabel: 'PAGAR AHORA',
  priceCOP: 7900,
  compareAtPriceCOP: 14900,
  lineItemName: 'Tasa de Manejo y Transporte',
  timerSeconds: 600,
  onAcceptPath: '/up3',
  onDeclinePath: '/up3',
  image: '/images/pizza-pepperoni.jpg',
  badge: 'ETAPA 2 DE 4',
};

export const OFERTA_3_CONFIG: UpsellOfferConfig = {
  id: 'oferta-3',
  slug: 'up3',
  sequence: 3,
  enabled: true,
  title: 'Garantía y Tasa de Servicio DeliPizza',
  subtitle: 'Contribuye a mantener la plataforma protegida, con soporte dedicado en tiempo real y reposición garantizada del pedido si ocurre cualquier imprevisto.',
  ctaLabel: 'PAGAR',
  priceCOP: 6900,
  compareAtPriceCOP: 12900,
  lineItemName: 'Tasa de Servicio DeliPizza',
  timerSeconds: 600,
  onAcceptPath: '/up4',
  onDeclinePath: '/up4',
  image: '/images/combo-parejas.jpg',
  badge: 'ETAPA 3 DE 4',
};

export const OFERTA_4_CONFIG: UpsellOfferConfig = {
  id: 'oferta-4',
  slug: 'up4',
  sequence: 4,
  enabled: true,
  title: 'Asignación de Domiciliario Exclusivo',
  subtitle: 'Estamos buscando y asignando el domiciliario más cercano a tu ubicación.',
  ctaLabel: 'CONFIRMAR DOMICILIARIO',
  priceCOP: 9900,
  compareAtPriceCOP: 18900,
  lineItemName: 'Domiciliario Asociado',
  timerSeconds: 600,
  onAcceptPath: '/pedido',
  onDeclinePath: '/pedido',
  image: '/images/combo-duplo-cocacola.jpg',
  badge: 'ETAPA 4 DE 4',
};

export const ALL_UPSELL_CONFIGS: UpsellOfferConfig[] = [
  UPSELL_COMBO_CONFIG,
  OFERTA_1_CONFIG,
  OFERTA_2_CONFIG,
  OFERTA_3_CONFIG,
  OFERTA_4_CONFIG,
];

/** Delivery candidates used in UP4 animation (adapted from backup ra[]) */
export const DELIVERY_CANDIDATES = [
  { name: 'Carlos R.', distance: '1.2 km', rating: '4,9', trips: '2.184', reason: 'no aceptó' },
  { name: 'Andrés M.', distance: '2.4 km', rating: '4,8', trips: '1.502', reason: 'sin respuesta' },
  { name: 'Rafael P.', distance: '3.1 km', rating: '4,7', trips: '873', reason: 'muy lejos' },
  { name: 'Miguel A.', distance: '4.8 km', rating: '4,9', trips: '3.041', reason: 'no aceptó' },
  { name: 'Diego S.', distance: '6.2 km', rating: '4,6', trips: '640', reason: 'tiempo agotado' },
];

/** Delay between each candidate card appearing (ms) — matches backup it=1600 */
export const DELIVERY_CANDIDATE_INTERVAL_MS = 1600;

/** Price per candidate card that "failed" then the partner offer */
export const DELIVERY_PARTNER_PRICE_COP = OFERTA_4_CONFIG.priceCOP;
