/**
 * Social proof configuration — reviews, testimonials, stats.
 * Centralised so they can be updated without touching components.
 * Mirrors the backup's relatos/testimonial/rating sections.
 */

export interface ReviewItem {
  id: string;
  name: string;
  rating: number; // 1–5
  comment: string;
  /** Hours ago — shown as "hace X horas" or "ayer" */
  hoursAgo: number;
  image?: string; // optional avatar URL
  verified?: boolean;
}

export const REVIEWS: ReviewItem[] = [
  {
    id: 'r1',
    name: 'Valentina R.',
    rating: 5,
    comment: '¡La mejor pizza de la ciudad! Llegó caliente, bien rellena y el borde de queso es increíble. Volvería a pedir.',
    hoursAgo: 2,
    verified: true,
  },
  {
    id: 'r2',
    name: 'Andrés M.',
    rating: 5,
    comment: 'Pedí el Super Combo 3 con mitad y mitad. Todo llegó perfecto. La Colombiana bien fría. 100% recomendado.',
    hoursAgo: 5,
    verified: true,
  },
  {
    id: 'r3',
    name: 'Camila T.',
    rating: 5,
    comment: 'Mejor pizzería con domicilio. Masa crocante, ingredientes frescos. El borde de queso y bocadillo es adictivo.',
    hoursAgo: 14,
    verified: true,
  },
  {
    id: 'r4',
    name: 'Santiago G.',
    rating: 5,
    comment: 'Pedí para toda la familia. Llegó caliente en menos de 40 min. Los sabores colombianos como la Criolla y la Paisa son espectaculares.',
    hoursAgo: 22,
    verified: true,
  },
  {
    id: 'r5',
    name: 'Isabela C.',
    rating: 5,
    comment: 'Pizza de Nutella al final = perfección. Combo familiar súper completo. Lo recomiendo a todos mis amigos.',
    hoursAgo: 36,
    verified: true,
  },
  {
    id: 'r6',
    name: 'Juan P.',
    rating: 5,
    comment: 'Entrega rápida, pizza recién horneada. El pepperoni estaba crujiente y abundante. Pagaré con Nequi de nuevo.',
    hoursAgo: 47,
    verified: true,
  },
];

export interface StoreStats {
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryLabel: string;
}

export const STORE_STATS: StoreStats = {
  rating: 4.9,
  reviewCount: 1847,
  deliveryTime: '25–45 min',
  deliveryLabel: 'Domicilio Gratis',
};
