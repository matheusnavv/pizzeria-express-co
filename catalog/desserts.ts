import { DessertItem } from './types';

export const DESSERTS_CATALOG: DessertItem[] = [
  {
    id: 'pizza-arequipe-queso',
    name: 'Pizza de Arequipe y Queso',
    portion: 'Personal · 4 porciones',
    description: 'La consentida de Colombia: arequipe artesanal cremoso combinado con queso mozzarella fundido sobre masa crujiente.',
    priceCOP: 12900,
    category: 'algo-dulce',
    image: '/images/products/pizza-arequipe-queso.webp',
  },
  {
    id: 'pizza-bocadillo-queso',
    name: 'Pizza de Bocadillo y Queso',
    portion: 'Personal · 4 porciones',
    description: 'Delicioso bocadillo veleño de guayaba con queso mozzarella derretido, el matrimonio perfecto.',
    priceCOP: 12900,
    category: 'algo-dulce',
    image: '/images/products/pizza-bocadillo-queso.webp',
  },
  {
    id: 'pizza-nutella',
    name: 'Pizza de Nutella',
    portion: 'Personal · 4 porciones',
    description: 'Generosa capa de Nutella original con avellanas tostadas sobre masa caliente y crocante.',
    priceCOP: 14900,
    category: 'algo-dulce',
    image: '/images/products/pizza-nutella.webp',
  },
  {
    id: 'brownie-chocolate',
    name: 'Brownie de Chocolate',
    portion: '1 unidad',
    description: 'Brownie de chocolate melcochudo con trozos de nuez y centro fundido.',
    priceCOP: 6900,
    category: 'algo-dulce',
    image: '/images/products/brownie.webp',
  },
];

export const DESSERTS_MAP = new Map(DESSERTS_CATALOG.map((d) => [d.id, d]));
