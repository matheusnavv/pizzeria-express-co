import { SideItem } from './types';

export const SIDES_CATALOG: SideItem[] = [
  {
    id: 'pan-de-ajo-queso',
    name: 'Pan de Ajo con Queso',
    portion: '4 unidades',
    description: 'Pan artesanal horneado con mantequilla de ajo, hierbas aromáticas y gratinado con queso mozzarella.',
    priceCOP: 6900,
    category: 'para-acompanar',
    image: '/images/products/pan-de-ajo.webp',
  },
  {
    id: 'dedos-de-queso',
    name: 'Dedos de Queso',
    portion: '6 unidades',
    description: 'Crujientes por fuera con abundante queso mozzarella fundido por dentro. Acompañados de salsa agridulce.',
    priceCOP: 9900,
    category: 'para-acompanar',
    image: '/images/products/dedos-de-queso.webp',
  },
  {
    id: 'papas-francesa',
    name: 'Papas a la Francesa',
    portion: '1 porción',
    description: 'Papas doradas y crocantes sazonadas con sal marina y páprika suave.',
    priceCOP: 7900,
    category: 'para-acompanar',
    image: '/images/products/papas-a-la-francesa.webp',
  },
];

export const SIDES_MAP = new Map(SIDES_CATALOG.map((s) => [s.id, s]));
