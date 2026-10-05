import { describe, it, expect } from 'vitest';
import {
  calculateItemPrice,
  calculateOrderPricing,
  calculateSinglePizzaPrice,
  formatCOP,
  formatCOPShort,
} from '@/catalog/pricing';
import { getCrustPrice } from '@/catalog/crusts';
import { getExtraPrice, EXTRA_BASE_PRICES_BY_SIZE } from '@/catalog/extras';
import { siteConfig } from '@/config/siteConfig';

describe('1. Formateo de Moneda Colombiana (COP)', () => {
  it('formatea números enteros con separador de miles colombiano ($XX.XXX COP)', () => {
    expect(formatCOP(27900)).toBe('$27.900 COP');
    expect(formatCOP(35900)).toBe('$35.900 COP');
    expect(formatCOP(1000000)).toBe('$1.000.000 COP');
    expect(formatCOP(0)).toBe('$0 COP');
  });

  it('formatea números cortos sin sufijo COP ($XX.XXX)', () => {
    expect(formatCOPShort(27900)).toBe('$27.900');
    expect(formatCOPShort(71900)).toBe('$71.900');
  });
});

describe('2. Pedido Mínimo ($27.900 COP)', () => {
  it('identifica cuando el subtotal no alcanza el pedido mínimo', () => {
    const result = calculateOrderPricing([
      { productId: 'pan-de-ajo-queso', quantity: 1 }, // 6.900 COP
    ]);
    expect(result.subtotalCOP).toBe(6900);
    expect(result.isMinOrderMet).toBe(false);
    expect(result.minOrderRequiredCOP).toBe(27900);
  });

  it('aprueba cuando el subtotal es igual o mayor a $27.900 COP', () => {
    const result = calculateOrderPricing([
      { productId: 'super-combo-1', quantity: 1 }, // 27.900 COP
    ]);
    expect(result.subtotalCOP).toBe(27900);
    expect(result.isMinOrderMet).toBe(true);
  });
});

describe('3. Cálculo de Super Combos y Combos Especiales', () => {
  it('calcula los precios fijos exactos de los 6 Super Combos', () => {
    expect(calculateItemPrice('super-combo-1', 1).unitPriceCOP).toBe(27900);
    expect(calculateItemPrice('super-combo-2', 1).unitPriceCOP).toBe(35900);
    expect(calculateItemPrice('super-combo-3', 1).unitPriceCOP).toBe(42900);
    expect(calculateItemPrice('super-combo-4', 1).unitPriceCOP).toBe(55900);
    expect(calculateItemPrice('super-combo-5', 1).unitPriceCOP).toBe(62900);
    expect(calculateItemPrice('super-combo-6', 1).unitPriceCOP).toBe(71900);
  });

  it('calcula los Combos Especiales a $31.900 COP cada uno', () => {
    expect(calculateItemPrice('combo-especial-hawaiana', 1).unitPriceCOP).toBe(31900);
    expect(calculateItemPrice('combo-especial-pepperoni', 1).unitPriceCOP).toBe(31900);
    expect(calculateItemPrice('combo-especial-carnes', 1).unitPriceCOP).toBe(31900);
  });
});

describe('4. Bordes Rellenos por Tamaño', () => {
  it('el borde tradicional siempre es $0 COP (incluido)', () => {
    expect(getCrustPrice('traditional', 'personal')).toBe(0);
    expect(getCrustPrice('traditional', 'mediana')).toBe(0);
    expect(getCrustPrice('traditional', 'familiar')).toBe(0);
    expect(getCrustPrice('traditional', 'gigante')).toBe(0);
    expect(getCrustPrice('traditional', 'extragrande')).toBe(0);
  });

  it('el borde de queso tiene precios escalonados por tamaño', () => {
    expect(getCrustPrice('cheese', 'personal')).toBe(5900);
    expect(getCrustPrice('cheese', 'mediana')).toBe(6900);
    expect(getCrustPrice('cheese', 'familiar')).toBe(7900);
    expect(getCrustPrice('cheese', 'gigante')).toBe(9900);
    expect(getCrustPrice('cheese', 'extragrande')).toBe(10900);
  });

  it('el borde de queso y bocadillo suma ~$2.000 COP sobre el borde de queso', () => {
    expect(getCrustPrice('cheese_bocadillo', 'personal')).toBe(7900);
    expect(getCrustPrice('cheese_bocadillo', 'mediana')).toBe(8900);
    expect(getCrustPrice('cheese_bocadillo', 'familiar')).toBe(9900);
    expect(getCrustPrice('cheese_bocadillo', 'gigante')).toBe(11900);
    expect(getCrustPrice('cheese_bocadillo', 'extragrande')).toBe(12900);
  });
});

describe('5. Ingredientes Adicionales y Límite de Extras', () => {
  it('calcula adicionales por tamaño de pizza', () => {
    expect(getExtraPrice('tocineta', 'personal')).toBe(3900);
    expect(getExtraPrice('tocineta', 'mediana')).toBe(4900);
    expect(getExtraPrice('tocineta', 'familiar')).toBe(5900);
    expect(getExtraPrice('tocineta', 'gigante')).toBe(6900);
    expect(getExtraPrice('tocineta', 'extragrande')).toBe(7900);
  });

  it('aplica límite máximo de 5 extras por pizza', () => {
    const singlePizza = calculateSinglePizzaPrice({
      sizeId: 'familiar',
      isHalfAndHalf: false,
      primaryFlavorId: 'hawaiana',
      crustId: 'traditional',
      // Intentamos pasar 7 extras
      extraIngredientIds: ['tocineta', 'pollo', 'maiz', 'queso-extra', 'pina', 'cebolla', 'pimenton'],
    });

    // Solo debe cobrar los primeros 5 extras (5 * 5.900 = 29.500 COP)
    expect(singlePizza.extrasPriceCOP).toBe(5 * EXTRA_BASE_PRICES_BY_SIZE.familiar);
    expect(singlePizza.crustPriceCOP).toBe(0);
    expect(singlePizza.totalCustomizationCOP).toBe(29500);
  });
});

describe('6. Mitad y Mitad y Bebidas en Combos', () => {
  it('mitad y mitad no genera costo adicional sobre el combo', () => {
    const pricingWithoutHalf = calculateItemPrice('super-combo-2', 1, {
      pizzas: [
        {
          sizeId: 'mediana',
          isHalfAndHalf: false,
          primaryFlavorId: 'hawaiana',
          crustId: 'traditional',
          extraIngredientIds: [],
        },
        {
          sizeId: 'mediana',
          isHalfAndHalf: false,
          primaryFlavorId: 'pepperoni',
          crustId: 'traditional',
          extraIngredientIds: [],
        },
      ],
    });

    const pricingWithHalf = calculateItemPrice('super-combo-2', 1, {
      pizzas: [
        {
          sizeId: 'mediana',
          isHalfAndHalf: true,
          primaryFlavorId: 'hawaiana',
          secondaryFlavorId: 'pollo-champinones',
          crustId: 'traditional',
          extraIngredientIds: [],
        },
        {
          sizeId: 'mediana',
          isHalfAndHalf: true,
          primaryFlavorId: 'carnes',
          secondaryFlavorId: 'paisa',
          crustId: 'traditional',
          extraIngredientIds: [],
        },
      ],
    });

    expect(pricingWithoutHalf.unitPriceCOP).toBe(35900);
    expect(pricingWithHalf.unitPriceCOP).toBe(35900);
  });

  it('cobra bordes independientes por cada pizza dentro de un combo', () => {
    // Super Combo 1 (2 personales): Pizza 1 con borde de queso (+5.900), Pizza 2 tradicional (+0)
    const pricing = calculateItemPrice('super-combo-1', 1, {
      pizzas: [
        {
          sizeId: 'personal',
          isHalfAndHalf: false,
          primaryFlavorId: 'hawaiana',
          crustId: 'cheese', // +5.900
          extraIngredientIds: [],
        },
        {
          sizeId: 'personal',
          isHalfAndHalf: false,
          primaryFlavorId: 'pepperoni',
          crustId: 'traditional', // +0
          extraIngredientIds: [],
        },
      ],
    });

    // 27.900 + 5.900 = 33.800 COP
    expect(pricing.unitPriceCOP).toBe(27900 + 5900);
  });
});

describe('7. Recálculo Estricto Server-Side', () => {
  it('ignora precios manipulados por el cliente y recalcula desde el catálogo oficial', () => {
    // Simulamos un payload cliente manipulado
    const clientPayload = [
      {
        productId: 'super-combo-1', // Vale 27.900
        quantity: 2,
        // Cliente intentó inyectar un precio de $1.000 COP
        unitPriceCOP: 1000,
        totalPriceCOP: 2000,
      },
    ];

    const recalculated = calculateOrderPricing(clientPayload);
    // El servidor recalcula: 2 * 27.900 = 55.800 COP
    expect(recalculated.subtotalCOP).toBe(55800);
    expect(recalculated.totalCOP).toBe(55800);
  });
});
