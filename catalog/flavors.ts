import { Flavor } from './types';

export const PIZZA_FLAVORS: Flavor[] = [
  // ── TRADICIONALES ──────────────────────────────────────────────────────────
  {
    id: 'hawaiana',
    name: 'Hawaiana',
    description: 'La favorita clásica con jamón seleccionado, piña caramelizada y queso mozzarella fundido.',
    ingredients: ['Jamón', 'Piña', 'Queso mozzarella', 'Salsa de tomate clásica'],
    category: 'tradicionales',
    isPopular: true,
    badge: 'MÁS PEDIDA',
    image: '/images/products/pizza-hawaiana.webp',
  },
  {
    id: 'pollo-champinones',
    name: 'Pollo con Champiñones',
    description: 'Pechuga de pollo desmechada marinada con champiñones frescos y queso mozzarella.',
    ingredients: ['Pollo desmechado', 'Champiñones frescos', 'Queso mozzarella'],
    category: 'tradicionales',
    isPopular: true,
    image: '/images/products/pizza-pollo-champinones.webp',
  },
  {
    id: 'pepperoni',
    name: 'Pepperoni',
    description: 'Generosa capa de pepperoni americano crujiente sobre salsa de tomate de la casa y mozzarella.',
    ingredients: ['Pepperoni', 'Salsa de tomate', 'Queso mozzarella'],
    category: 'tradicionales',
    isPopular: true,
    badge: 'FAVORITA',
    image: '/images/products/pizza-pepperoni.webp',
  },
  {
    id: 'jamon-queso',
    name: 'Jamón y Queso',
    description: 'La combinación tradicional y reconfortante de jamón tierno y abundante queso mozzarella.',
    ingredients: ['Jamón seleccionado', 'Queso mozzarella abundante'],
    category: 'tradicionales',
    image: '/images/products/pizza-jamon-queso.webp',
  },
  {
    id: 'napolitana',
    name: 'Napolitana',
    description: 'Rodajas de tomate fresco, orégano, aceitunas y abundante queso mozzarella sobre salsa artesanal.',
    ingredients: ['Tomate fresco', 'Aceitunas', 'Orégano', 'Queso mozzarella'],
    category: 'tradicionales',
    image: '/images/products/pizza-napolitana.webp',
  },
  {
    id: 'vegetariana',
    name: 'Vegetariana',
    description: 'Champiñones frescos, pimentón dulce, cebolla roja, rodajas de tomate y queso mozzarella.',
    ingredients: ['Champiñones', 'Pimentón dulce', 'Cebolla roja', 'Tomate fresco', 'Queso mozzarella'],
    category: 'tradicionales',
    isVegetarian: true,
    image: '/images/products/pizza-vegetariana.webp',
  },
  // ── ESPECIALES ─────────────────────────────────────────────────────────────
  {
    id: 'carnes',
    name: 'Carnes',
    description: 'Especial para carnívoros: selección de tocineta crocante, jamón y carne sazonada.',
    ingredients: ['Selección de carnes', 'Tocineta', 'Salsa de tomate artesanal', 'Queso mozzarella'],
    category: 'especiales',
    isPopular: true,
    image: '/images/products/pizza-carnes.webp',
  },
  {
    id: 'criolla',
    name: 'Criolla',
    description: 'Sabor colombiano auténtico con jugosa carne desmechada, maíz tierno dulce y mozzarella.',
    ingredients: ['Carne desmechada', 'Maíz tierno dulce', 'Queso mozzarella'],
    category: 'especiales',
    badge: 'TÍPICA COLOMBIANA',
    image: '/images/products/pizza-criolla.webp',
  },
  {
    id: 'paisa',
    name: 'Paisa',
    description: 'Inspiración tradicional con chorizo antioqueño, jamón, maíz dulce y queso mozzarella.',
    ingredients: ['Chorizo antioqueño', 'Jamón', 'Maíz tierno', 'Queso mozzarella'],
    category: 'especiales',
    badge: 'ESPECIALIDAD',
    image: '/images/products/pizza-paisa.webp',
  },
  {
    id: 'pollo-tocineta',
    name: 'Pollo Tocineta',
    description: 'Tiernos trozos de pollo, tocineta ahumada crujiente, maíz tierno y queso mozzarella.',
    ingredients: ['Pollo', 'Tocineta ahumada', 'Maíz dulce', 'Queso mozzarella'],
    category: 'especiales',
    image: '/images/products/pizza-pollo-tocineta.webp',
  },
  {
    id: 'miel-mostaza',
    name: 'Miel Mostaza',
    description: 'Pollo marinado, tocineta crocante y nuestra exclusiva salsa agridulce de miel mostaza.',
    ingredients: ['Pollo', 'Tocineta', 'Queso mozzarella', 'Salsa miel mostaza especial'],
    category: 'especiales',
    image: '/images/products/pizza-miel-mostaza.webp',
  },
  // ── DULCES ─────────────────────────────────────────────────────────────────
  {
    id: 'arequipe-queso',
    name: 'Arequipe y Queso',
    description: 'La consentida de Colombia: arequipe artesanal cremoso con queso mozzarella fundido.',
    ingredients: ['Arequipe artesanal', 'Queso mozzarella'],
    category: 'dulces',
    badge: 'DULCE COLOMBIANO',
    image: '/images/products/pizza-arequipe-queso.webp',
  },
  {
    id: 'bocadillo-queso',
    name: 'Bocadillo y Queso',
    description: 'Delicioso bocadillo veleño de guayaba con queso mozzarella derretido, el matrimonio perfecto.',
    ingredients: ['Bocadillo de guayaba', 'Queso mozzarella'],
    category: 'dulces',
    image: '/images/products/pizza-bocadillo-queso.webp',
  },
  {
    id: 'nutella',
    name: 'Nutella',
    description: 'Generosa capa de Nutella original con avellanas tostadas sobre masa caliente y crocante.',
    ingredients: ['Nutella', 'Avellanas tostadas'],
    category: 'dulces',
    image: '/images/products/pizza-nutella.webp',
  },
];

export const FLAVORS_MAP = new Map(PIZZA_FLAVORS.map((f) => [f.id, f]));

export type FlavorCategory = 'tradicionales' | 'especiales' | 'dulces';

export const FLAVOR_CATEGORIES: { id: FlavorCategory; label: string }[] = [
  { id: 'tradicionales', label: 'Tradicionales' },
  { id: 'especiales', label: 'Especiales' },
  { id: 'dulces', label: 'Dulces' },
];

export function getFlavorsByCategory(category: FlavorCategory): Flavor[] {
  return PIZZA_FLAVORS.filter((f) => f.category === category);
}
