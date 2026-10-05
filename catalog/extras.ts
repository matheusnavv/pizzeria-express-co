import { ExtraIngredient, PizzaSizeId } from './types';

export const EXTRA_BASE_PRICES_BY_SIZE: Record<PizzaSizeId, number> = {
  personal: 3900,
  mediana: 4900,
  familiar: 5900,
  gigante: 6900,
  extragrande: 7900,
};

export const EXTRA_INGREDIENTS: ExtraIngredient[] = [
  { id: 'queso-extra', name: 'Queso extra', pricesBySize: EXTRA_BASE_PRICES_BY_SIZE },
  { id: 'pepperoni', name: 'Pepperoni', pricesBySize: EXTRA_BASE_PRICES_BY_SIZE },
  { id: 'tocineta', name: 'Tocineta', pricesBySize: EXTRA_BASE_PRICES_BY_SIZE },
  { id: 'pollo', name: 'Pollo', pricesBySize: EXTRA_BASE_PRICES_BY_SIZE },
  { id: 'jamon', name: 'Jamón', pricesBySize: EXTRA_BASE_PRICES_BY_SIZE },
  { id: 'champinones', name: 'Champiñones', pricesBySize: EXTRA_BASE_PRICES_BY_SIZE },
  { id: 'maiz', name: 'Maíz tierno', pricesBySize: EXTRA_BASE_PRICES_BY_SIZE },
  { id: 'chorizo', name: 'Chorizo', pricesBySize: EXTRA_BASE_PRICES_BY_SIZE },
  { id: 'pina', name: 'Piña', pricesBySize: EXTRA_BASE_PRICES_BY_SIZE },
  { id: 'cebolla', name: 'Cebolla', pricesBySize: EXTRA_BASE_PRICES_BY_SIZE },
  { id: 'pimenton', name: 'Pimentón', pricesBySize: EXTRA_BASE_PRICES_BY_SIZE },
];

export const EXTRAS_MAP = new Map(EXTRA_INGREDIENTS.map((e) => [e.id, e]));

export function getExtraPrice(extraId: string, sizeId: PizzaSizeId): number {
  const extra = EXTRAS_MAP.get(extraId);
  if (!extra) return 0;
  return extra.pricesBySize[sizeId] ?? EXTRA_BASE_PRICES_BY_SIZE[sizeId] ?? 0;
}
