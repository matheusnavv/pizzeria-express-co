import { Drink } from './types';

export const DRINKS_CATALOG: Drink[] = [
  {
    id: 'coca-cola-original-1-5l',
    name: 'Coca-Cola Original 1.5 L',
    volume: '1.5 L',
    brand: 'Coca-Cola',
    priceCOP: 7900,
    image: '/images/products/coca-cola-original.webp',
  },
  {
    id: 'coca-cola-zero-1-5l',
    name: 'Coca-Cola Zero 1.5 L',
    volume: '1.5 L',
    brand: 'Coca-Cola',
    priceCOP: 7900,
    image: '/images/products/coca-cola-zero.webp',
  },
  {
    id: 'colombiana-postobon-1-5l',
    name: 'Colombiana Postobón 1.5 L',
    volume: '1.5 L',
    brand: 'Postobón',
    priceCOP: 7900,
    image: '/images/products/colombiana-postobon.webp',
  },
  {
    id: 'manzana-postobon-1-5l',
    name: 'Manzana Postobón 1.5 L',
    volume: '1.5 L',
    brand: 'Postobón',
    priceCOP: 7900,
    image: '/images/products/manzana-postobon.webp',
  },
];

export const DRINKS_MAP = new Map(DRINKS_CATALOG.map((d) => [d.id, d]));
