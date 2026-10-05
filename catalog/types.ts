/**
 * Catalog & Commerce TypeScript Type Definitions
 * All monetary amounts are stored as integers (COP without cents).
 */

export type PizzaSizeId = 'personal' | 'mediana' | 'familiar' | 'gigante' | 'extragrande';

export interface PizzaSizeDefinition {
  id: PizzaSizeId;
  name: string;
  slices: number;
  description: string;
  allowHalfAndHalf: boolean;
}

export interface Flavor {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  isPopular?: boolean;
  isVegetarian?: boolean;
  badge?: string;
  image: string;
}

export type CrustTypeId = 'traditional' | 'cheese' | 'cheese_bocadillo';

export interface CrustOption {
  id: CrustTypeId;
  name: string;
  description: string;
  pricesBySize: Record<PizzaSizeId, number>;
  image: string;
}

export interface ExtraIngredient {
  id: string;
  name: string;
  pricesBySize: Record<PizzaSizeId, number>;
}

export interface Drink {
  id: string;
  name: string;
  volume: string;
  brand: string;
  priceCOP: number;
  image: string;
}

export interface SideItem {
  id: string;
  name: string;
  portion: string;
  description: string;
  priceCOP: number;
  category: 'para-acompanar';
  image: string;
}

export interface DessertItem {
  id: string;
  name: string;
  portion: string;
  description: string;
  priceCOP: number;
  category: 'algo-dulce';
  image: string;
}

/**
 * Individual Pizza Configuration within an item
 */
export interface SinglePizzaConfig {
  sizeId: PizzaSizeId;
  isHalfAndHalf: boolean;
  primaryFlavorId: string;
  secondaryFlavorId?: string; // required if isHalfAndHalf is true
  crustId: CrustTypeId;
  extraIngredientIds: string[]; // max 5
  notes?: string; // max 500 chars
}

/**
 * Customization payload saved per item in cart and order
 */
export interface ItemCustomization {
  pizzas?: SinglePizzaConfig[]; // For combos with 1, 2, or 3 pizzas
  selectedDrinkIds?: string[]; // For combos with 1, 2, or 3 drinks
  customerNotes?: string;
}

export type ProductCategory = 
  | 'super-combos'
  | 'combos-especiales'
  | 'pizzas-individuales'
  | 'para-acompanar'
  | 'algo-dulce'
  | 'bebidas';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  headline?: string;
  description: string;
  basePriceCOP: number;
  badge?: string;
  image: string;
  isCombo: boolean;
  comboDetails?: {
    pizzaCount: number;
    pizzaSizeId: PizzaSizeId;
    drinkCount: number;
    drinkSize?: string;
    fixedFlavorId?: string; // For Combos Especiales that are flavor-specific
  };
}

export interface CartItem {
  cartItemId: string; // unique client UUID for this configuration
  productId: string;
  quantity: number;
  customization?: ItemCustomization;
  // Calculated on server, cached on client for fast UI feedback
  unitPriceCOP: number;
  totalPriceCOP: number;
  name: string;
  image: string;
}

export interface CartPricingSummary {
  subtotalCOP: number;
  deliveryFeeCOP: number;
  totalCOP: number;
  isMinOrderMet: boolean;
  minOrderRequiredCOP: number;
  itemCount: number;
}
