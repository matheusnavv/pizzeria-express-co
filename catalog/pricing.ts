import { PRODUCTS_MAP } from './products';
import { getCrustPrice } from './crusts';
import { getExtraPrice } from './extras';
import { ItemCustomization, SinglePizzaConfig } from './types';
import { siteConfig } from '../config/siteConfig';

export interface SinglePizzaPricingBreakdown {
  crustPriceCOP: number;
  extrasPriceCOP: number;
  totalCustomizationCOP: number;
}

export interface ItemPricingBreakdown {
  basePriceCOP: number;
  customizationsPriceCOP: number;
  unitPriceCOP: number;
  totalPriceCOP: number;
  pizzaBreakdowns: SinglePizzaPricingBreakdown[];
}

export interface OrderPricingResult {
  subtotalCOP: number;
  deliveryFeeCOP: number;
  totalCOP: number;
  isMinOrderMet: boolean;
  minOrderRequiredCOP: number;
  totalItemCount: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPriceCOP: number;
    totalPriceCOP: number;
    customization?: ItemCustomization;
  }>;
}

/**
 * Calculates customization price for a single pizza (crust + extras)
 */
export function calculateSinglePizzaPrice(pizza: SinglePizzaConfig): SinglePizzaPricingBreakdown {
  const crustPriceCOP = getCrustPrice(pizza.crustId, pizza.sizeId);

  // Extras limit: max 5 extras per pizza
  const validExtras = (pizza.extraIngredientIds || []).slice(0, siteConfig.commerce.maxExtrasPerPizza);
  const extrasPriceCOP = validExtras.reduce((sum, extraId) => {
    return sum + getExtraPrice(extraId, pizza.sizeId);
  }, 0);

  return {
    crustPriceCOP,
    extrasPriceCOP,
    totalCustomizationCOP: crustPriceCOP + extrasPriceCOP,
  };
}

/**
 * Deterministically calculates unit price and total price for an item based on catalog
 */
export function calculateItemPrice(
  productId: string,
  quantity: number,
  customization?: ItemCustomization
): ItemPricingBreakdown {
  const product = PRODUCTS_MAP.get(productId);
  if (!product) {
    throw new Error(`Producto con ID ${productId} no existe en el catálogo oficial.`);
  }

  const basePriceCOP = product.basePriceCOP;
  let customizationsPriceCOP = 0;
  const pizzaBreakdowns: SinglePizzaPricingBreakdown[] = [];

  if (customization?.pizzas && customization.pizzas.length > 0) {
    // If it's a combo, verify we don't calculate more pizzas than combo specifies
    const maxPizzas = product.comboDetails?.pizzaCount ?? 1;
    const pizzasToCalculate = customization.pizzas.slice(0, maxPizzas);

    for (const pizza of pizzasToCalculate) {
      // Ensure size matches combo definition if it's a combo
      const enforcedSize = product.comboDetails?.pizzaSizeId ?? pizza.sizeId;
      const breakdown = calculateSinglePizzaPrice({
        ...pizza,
        sizeId: enforcedSize,
      });
      pizzaBreakdowns.push(breakdown);
      customizationsPriceCOP += breakdown.totalCustomizationCOP;
    }
  }

  const unitPriceCOP = basePriceCOP + customizationsPriceCOP;
  const safeQuantity = Math.max(1, Math.min(quantity, siteConfig.commerce.maxItemQuantity));
  const totalPriceCOP = unitPriceCOP * safeQuantity;

  return {
    basePriceCOP,
    customizationsPriceCOP,
    unitPriceCOP,
    totalPriceCOP,
    pizzaBreakdowns,
  };
}

/**
 * Calculates complete order pricing strictly server-side
 */
export function calculateOrderPricing(
  rawItems: Array<{
    productId: string;
    quantity: number;
    customization?: ItemCustomization;
  }>
): OrderPricingResult {
  if (!rawItems || rawItems.length === 0) {
    return {
      subtotalCOP: 0,
      deliveryFeeCOP: siteConfig.commerce.deliveryFeeCOP,
      totalCOP: 0,
      isMinOrderMet: false,
      minOrderRequiredCOP: siteConfig.commerce.minOrderCOP,
      totalItemCount: 0,
      items: [],
    };
  }

  // Cap total items in cart
  const cappedItems = rawItems.slice(0, siteConfig.commerce.maxCartItems);

  let subtotalCOP = 0;
  let totalItemCount = 0;
  const items: OrderPricingResult['items'] = [];

  for (const item of cappedItems) {
    const product = PRODUCTS_MAP.get(item.productId);
    if (!product) {
      continue; // Skip invalid products
    }

    const pricing = calculateItemPrice(item.productId, item.quantity, item.customization);
    subtotalCOP += pricing.totalPriceCOP;
    totalItemCount += item.quantity;

    items.push({
      productId: item.productId,
      productName: product.name,
      quantity: item.quantity,
      unitPriceCOP: pricing.unitPriceCOP,
      totalPriceCOP: pricing.totalPriceCOP,
      customization: item.customization,
    });
  }

  const deliveryFeeCOP = siteConfig.commerce.freeDelivery ? 0 : siteConfig.commerce.deliveryFeeCOP;
  const totalCOP = subtotalCOP + deliveryFeeCOP;
  const isMinOrderMet = subtotalCOP >= siteConfig.commerce.minOrderCOP;

  return {
    subtotalCOP,
    deliveryFeeCOP,
    totalCOP,
    isMinOrderMet,
    minOrderRequiredCOP: siteConfig.commerce.minOrderCOP,
    totalItemCount,
    items,
  };
}

/**
 * Colombian currency formatter:
 * Formats integers as $XX.XXX COP (e.g. 27900 -> $27.900)
 */
export function formatCOP(amount: number): string {
  const rounded = Math.round(amount || 0);
  const formatted = rounded.toLocaleString('es-CO');
  return `$${formatted} COP`;
}

/**
 * Short Colombian currency formatter (without COP suffix for badges/cards)
 */
export function formatCOPShort(amount: number): string {
  const rounded = Math.round(amount || 0);
  const formatted = rounded.toLocaleString('es-CO');
  return `$${formatted}`;
}
