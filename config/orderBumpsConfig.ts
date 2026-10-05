/**
 * Centralized Order Bumps configuration for checkout.
 * Preserves the backup's beverage cross-sell mechanics with Colombian drinks.
 */

export interface OrderBumpItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  originalPriceCOP: number;
  promoPriceCOP: number;
  description: string;
  badge?: string;
}

export const CHECKOUT_ORDER_BUMPS: OrderBumpItem[] = [
  {
    id: 'bump-coca-cola-15l',
    productId: 'coca-cola-original-1-5l',
    name: 'Coca-Cola Original 1.5 L Bien Fría',
    image: '/images/coca-cola-15.jpg',
    originalPriceCOP: 7900,
    promoPriceCOP: 5900,
    description: 'La compañera perfecta para tu pizza recién horneada.',
    badge: 'AHORRA $2.000 COP',
  },
  {
    id: 'bump-colombiana-15l',
    productId: 'colombiana-postobon-1-5l',
    name: 'Colombiana Postobón 1.5 L',
    image: '/images/colombiana-15.jpg',
    originalPriceCOP: 7900,
    promoPriceCOP: 5900,
    description: 'El sabor tradicional de nuestra tierra para disfrutar en combo.',
    badge: 'AHORRA $2.000 COP',
  },
];
