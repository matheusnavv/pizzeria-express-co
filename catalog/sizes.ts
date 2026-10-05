import { PizzaSizeDefinition, PizzaSizeId } from './types';

export const PIZZA_SIZES: Record<PizzaSizeId, PizzaSizeDefinition> = {
  personal: {
    id: 'personal',
    name: 'Personal',
    slices: 4,
    description: '4 porciones individuales',
    allowHalfAndHalf: false,
  },
  mediana: {
    id: 'mediana',
    name: 'Mediana',
    slices: 6,
    description: '6 porciones ideales para 2 personas',
    allowHalfAndHalf: true,
  },
  familiar: {
    id: 'familiar',
    name: 'Familiar',
    slices: 8,
    description: '8 porciones para toda la familia',
    allowHalfAndHalf: true,
  },
  gigante: {
    id: 'gigante',
    name: 'Gigante',
    slices: 10,
    description: '10 porciones grandes para compartir',
    allowHalfAndHalf: true,
  },
  extragrande: {
    id: 'extragrande',
    name: 'Extragrande',
    slices: 12,
    description: '12 porciones gigantes para fiestas y grupos',
    allowHalfAndHalf: true,
  },
};

export const SIZES_ORDER: PizzaSizeId[] = ['personal', 'mediana', 'familiar', 'gigante', 'extragrande'];
