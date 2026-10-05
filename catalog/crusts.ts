import { CrustOption, CrustTypeId, PizzaSizeId } from './types';

export const CRUST_OPTIONS: Record<CrustTypeId, CrustOption> = {
  traditional: {
    id: 'traditional',
    name: 'Borde tradicional',
    description: 'Masa artesanal horneada con toque de aceite de oliva y orégano. ¡Incluido sin costo!',
    pricesBySize: {
      personal: 0,
      mediana: 0,
      familiar: 0,
      gigante: 0,
      extragrande: 0,
    },
    image: '/images/crusts/borde-tradicional.webp',
  },
  cheese: {
    id: 'cheese',
    name: 'Borde relleno de queso',
    description: 'Generoso borde relleno de queso mozzarella fundido que se estira en cada bocado.',
    pricesBySize: {
      personal: 5900,
      mediana: 6900,
      familiar: 7900,
      gigante: 9900,
      extragrande: 10900,
    },
    image: '/images/crusts/borde-queso.webp',
  },
  cheese_bocadillo: {
    id: 'cheese_bocadillo',
    name: 'Borde de queso y bocadillo',
    description: 'El clásico manjar colombiano: combinación dulce y salada de queso mozzarella y bocadillo de guayaba.',
    pricesBySize: {
      personal: 7900,
      mediana: 8900,
      familiar: 9900,
      gigante: 11900,
      extragrande: 12900,
    },
    image: '/images/crusts/borde-queso-bocadillo.webp',
  },
};

export const CRUSTS_LIST: CrustOption[] = Object.values(CRUST_OPTIONS);

export function getCrustPrice(crustId: CrustTypeId, sizeId: PizzaSizeId): number {
  const crust = CRUST_OPTIONS[crustId] || CRUST_OPTIONS.traditional;
  return crust.pricesBySize[sizeId] ?? 0;
}
