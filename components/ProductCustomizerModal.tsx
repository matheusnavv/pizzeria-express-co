'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Check,
  Pizza,
  Plus,
  Minus,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Product, SinglePizzaConfig, PizzaSizeId, CrustTypeId } from '@/catalog/types';
import { PIZZA_SIZES } from '@/catalog/sizes';
import {
  PIZZA_FLAVORS,
  FLAVOR_CATEGORIES,
  getFlavorsByCategory,
  type FlavorCategory,
} from '@/catalog/flavors';
import { CRUSTS_LIST, getCrustPrice } from '@/catalog/crusts';
import { EXTRA_INGREDIENTS, getExtraPrice } from '@/catalog/extras';
import { DRINKS_CATALOG } from '@/catalog/drinks';
import { calculateItemPrice, formatCOP, formatCOPShort } from '@/catalog/pricing';
import { siteConfig } from '@/config/siteConfig';
import { getProductImage } from '@/catalog/imageManifest';
import {
  trackCustomizerStarted,
  trackFlavorSelected,
  trackHalfAndHalfSelected,
  trackCrustSelected,
  trackExtraSelected,
} from '@/lib/analytics/meta';

interface ProductCustomizerModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    productId: string,
    quantity: number,
    customization?: {
      pizzas?: SinglePizzaConfig[];
      selectedDrinkIds?: string[];
      customerNotes?: string;
    }
  ) => void;
  /** Pre-filled customization for editing an existing cart item */
  editCustomization?: {
    pizzas?: SinglePizzaConfig[];
    selectedDrinkIds?: string[];
    customerNotes?: string;
  };
  editQuantity?: number;
}

export const ProductCustomizerModal: React.FC<ProductCustomizerModalProps> = ({
  product,
  onClose,
  onAddToCart,
  editCustomization,
  editQuantity,
}) => {
  if (!product) return null;

  return (
    <ProductCustomizerModalInner
      product={product}
      onClose={onClose}
      onAddToCart={onAddToCart}
      editCustomization={editCustomization}
      editQuantity={editQuantity}
    />
  );
};

interface InnerProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (
    productId: string,
    quantity: number,
    customization?: {
      pizzas?: SinglePizzaConfig[];
      selectedDrinkIds?: string[];
      customerNotes?: string;
    }
  ) => void;
  editCustomization?: {
    pizzas?: SinglePizzaConfig[];
    selectedDrinkIds?: string[];
    customerNotes?: string;
  };
  editQuantity?: number;
}

/**
 * Build an empty (unselected) pizza config.
 * primaryFlavorId = '' signals "user has not chosen yet".
 */
function emptyPizzaConfig(sizeId: PizzaSizeId, fixedFlavorId?: string): SinglePizzaConfig {
  return {
    sizeId,
    isHalfAndHalf: false,
    primaryFlavorId: fixedFlavorId || '',
    secondaryFlavorId: undefined,
    crustId: 'traditional',
    extraIngredientIds: [],
    notes: '',
  };
}

const ProductCustomizerModalInner: React.FC<InnerProps> = ({
  product,
  onClose,
  onAddToCart,
  editCustomization,
  editQuantity,
}) => {
  const isCombo = Boolean(product.isCombo && product.comboDetails);
  const pizzaCount = product.comboDetails?.pizzaCount ?? 1;
  const pizzaSizeId = product.comboDetails?.pizzaSizeId ?? 'mediana';
  const drinkCount = product.comboDetails?.drinkCount ?? 0;
  const sizeDef = PIZZA_SIZES[pizzaSizeId];
  const isEditing = Boolean(editCustomization);

  // ── Pizza configurations ────────────────────────────────────────────────
  const [pizzas, setPizzas] = useState<SinglePizzaConfig[]>(() => {
    if (editCustomization?.pizzas && editCustomization.pizzas.length > 0) {
      return editCustomization.pizzas;
    }
    return Array.from({ length: pizzaCount }, () =>
      emptyPizzaConfig(pizzaSizeId, product.comboDetails?.fixedFlavorId)
    );
  });

  // ── Drink selection ─────────────────────────────────────────────────────
  const [selectedDrinks, setSelectedDrinks] = useState<string[]>(() => {
    if (editCustomization?.selectedDrinkIds) return editCustomization.selectedDrinkIds;
    // Pre-fill with empty string = "not chosen"
    return Array.from({ length: drinkCount }, () => '');
  });

  // ── UI state ────────────────────────────────────────────────────────────
  const [quantity, setQuantity] = useState(editQuantity ?? 1);
  const [activePizzaIndex, setActivePizzaIndex] = useState(0);
  const [activeFlavorTab, setActiveFlavorTab] = useState<FlavorCategory>('tradicionales');
  const [isAdding, setIsAdding] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Track CustomizerStarted once on open
  useEffect(() => {
    trackCustomizerStarted({ productId: product.id, productName: product.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Pizza helpers ───────────────────────────────────────────────────────
  const updatePizza = (index: number, updates: Partial<SinglePizzaConfig>) => {
    setPizzas((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
    setValidationError(null);
  };

  const toggleExtra = (pizzaIndex: number, extraId: string) => {
    const currentExtras = pizzas[pizzaIndex].extraIngredientIds;
    const exists = currentExtras.includes(extraId);

    if (exists) {
      updatePizza(pizzaIndex, {
        extraIngredientIds: currentExtras.filter((id) => id !== extraId),
      });
    } else {
      if (currentExtras.length >= siteConfig.commerce.maxExtrasPerPizza) return;
      const extra = EXTRA_INGREDIENTS.find((e) => e.id === extraId);
      if (extra) {
        trackExtraSelected({
          extraId,
          extraName: extra.name,
          priceCOP: getExtraPrice(extraId, pizzaSizeId),
        });
      }
      updatePizza(pizzaIndex, {
        extraIngredientIds: [...currentExtras, extraId],
      });
    }
  };

  /**
   * Toggle a flavor for the active pizza using the new simplified mechanic:
   * - 0 selected → tap flavor → 1 selected (pizza completa)
   * - 1 selected → tap same flavor → deselect
   * - 1 selected → tap different flavor → 2 selected (mitad y mitad)
   * - 2 selected → tap any selected flavor → remove it
   * - 2 selected → tap unselected → blocked (must remove first)
   */
  const toggleFlavor = (pizzaIndex: number, flavorId: string) => {
    const pizza = pizzas[pizzaIndex];
    const primaryId = pizza.primaryFlavorId;
    const secondaryId = pizza.secondaryFlavorId;
    const allowHalf = sizeDef.allowHalfAndHalf && !product.comboDetails?.fixedFlavorId;

    if (flavorId === primaryId) {
      // Deselect primary
      if (secondaryId) {
        // Promote secondary to primary
        updatePizza(pizzaIndex, {
          primaryFlavorId: secondaryId,
          secondaryFlavorId: undefined,
          isHalfAndHalf: false,
        });
      } else {
        updatePizza(pizzaIndex, {
          primaryFlavorId: '',
          isHalfAndHalf: false,
        });
      }
      return;
    }

    if (flavorId === secondaryId) {
      // Deselect secondary
      updatePizza(pizzaIndex, {
        secondaryFlavorId: undefined,
        isHalfAndHalf: false,
      });
      return;
    }

    // New flavor
    if (!primaryId) {
      // First selection
      updatePizza(pizzaIndex, { primaryFlavorId: flavorId });
      trackFlavorSelected({
        flavorId,
        flavorName: PIZZA_FLAVORS.find((f) => f.id === flavorId)?.name || flavorId,
        pizzaIndex,
        isHalfAndHalf: false,
      });
    } else if (!secondaryId && allowHalf) {
      // Second selection → mitad y mitad
      updatePizza(pizzaIndex, {
        secondaryFlavorId: flavorId,
        isHalfAndHalf: true,
      });
      trackHalfAndHalfSelected({
        flavorA: primaryId,
        flavorB: flavorId,
      });
    }
    // If already 2 selected and user taps a third, do nothing (already blocked by UI)
  };

  const getFlavorSelectionCount = (pizzaIndex: number): number => {
    const p = pizzas[pizzaIndex];
    return (p.primaryFlavorId ? 1 : 0) + (p.secondaryFlavorId ? 1 : 0);
  };

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = (): string | null => {
    for (let i = 0; i < pizzas.length; i++) {
      const p = pizzas[i];
      if (!product.comboDetails?.fixedFlavorId && !p.primaryFlavorId) {
        return `Debes elegir al menos un sabor para la Pizza ${i + 1}.`;
      }
    }
    for (let i = 0; i < selectedDrinks.length; i++) {
      if (!selectedDrinks[i]) {
        return `Debes elegir una gaseosa (Bebida ${i + 1}).`;
      }
    }
    return null;
  };

  const isValid = validate() === null;

  // ── Pricing ─────────────────────────────────────────────────────────────
  // Use empty strings for unselected flavors (still valid for pricing)
  const pricingPizzas = pizzas.map((p) => ({
    ...p,
    primaryFlavorId: p.primaryFlavorId || 'hawaiana', // fallback for price calc only
  }));
  const pricing = calculateItemPrice(product.id, quantity, {
    pizzas: pricingPizzas,
    selectedDrinkIds: selectedDrinks.filter(Boolean),
  });

  const handleAdd = () => {
    const err = validate();
    if (err) {
      setValidationError(err);
      return;
    }
    if (isAdding) return;
    setIsAdding(true);

    onAddToCart(product.id, quantity, {
      pizzas,
      selectedDrinkIds: selectedDrinks,
    });

    onClose();
  };

  const currentPizza = pizzas[activePizzaIndex];
  const selectionCount = getFlavorSelectionCount(activePizzaIndex);
  const maxSelections = sizeDef.allowHalfAndHalf && !product.comboDetails?.fixedFlavorId ? 2 : 1;
  const imageUrl = getProductImage(product.image);

  const isFlavorSelected = (flavorId: string) =>
    currentPizza.primaryFlavorId === flavorId || currentPizza.secondaryFlavorId === flavorId;

  const isFlavorDisabled = (flavorId: string) =>
    selectionCount >= maxSelections && !isFlavorSelected(flavorId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customizer-modal-title"
    >
      {/* Mobile Bottom Sheet */}
      <div className="w-full sm:max-w-2xl h-[94vh] sm:h-auto sm:max-h-[90vh] bg-[#0E1522] border-t sm:border border-surface-border rounded-t-[28px] sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Drag Handle */}
        <div className="w-full flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-neutral-600/60" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-surface-border flex items-center justify-between bg-surface-card/90 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-surface-border relative overflow-hidden flex-shrink-0">
              <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="40px" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block leading-none mb-0.5">
                {isEditing ? 'Editar pedido' : 'Personaliza tu pedido'}
              </span>
              <h2 id="customizer-modal-title" className="text-base sm:text-lg font-black text-white truncate">
                {product.name}
              </h2>
            </div>
          </div>

          {/* Price badge */}
          <div className="flex items-center gap-2">
            {product.compareAtPriceCOP && (
              <span className="text-xs text-neutral-500 line-through font-mono hidden sm:block">
                {formatCOPShort(product.compareAtPriceCOP)}
              </span>
            )}
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors flex-shrink-0 active:scale-95"
              aria-label="Cerrar personalizador"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-5">

          {/* Pizza tabs for multi-pizza combos */}
          {pizzaCount > 1 && (
            <div className="space-y-2">
              <span className="text-xs font-black text-neutral-300 uppercase tracking-wider">
                Configura tus {pizzaCount} pizzas
              </span>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {pizzas.map((p, idx) => {
                  const count = getFlavorSelectionCount(idx);
                  const isComplete = count > 0;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePizzaIndex(idx)}
                      className={`flex-shrink-0 min-h-[48px] px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 border transition-all active:scale-95 ${
                        activePizzaIndex === idx
                          ? 'bg-brand-primary text-white border-brand-primary shadow-glow'
                          : isComplete
                          ? 'bg-emerald-600/20 text-emerald-300 border-emerald-600/40'
                          : 'bg-surface-card text-neutral-300 border-surface-border'
                      }`}
                    >
                      <Pizza className="w-3.5 h-3.5" />
                      <span>Pizza {idx + 1}</span>
                      {isComplete && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pizza config card */}
          <div className="bg-surface-card/90 border border-surface-border rounded-2xl p-4 sm:p-5 space-y-5">
            {/* Size label */}
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <span className="font-black text-sm text-white flex items-center gap-2">
                <Pizza className="w-4 h-4 text-amber-400" />
                {pizzaCount > 1 ? `Pizza ${activePizzaIndex + 1} de ${pizzaCount}` : 'Tu Pizza'}
              </span>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                {sizeDef.name} · {sizeDef.slices} porciones
              </span>
            </div>

            {/* Flavor selector */}
            {!product.comboDetails?.fixedFlavorId ? (
              <div className="space-y-3">
                {/* Header with counter */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-neutral-100 uppercase tracking-wider">
                    Elige el sabor
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Counter badge */}
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                        selectionCount === 0
                          ? 'bg-red-500/10 border-red-500/40 text-red-400'
                          : selectionCount === maxSelections
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}
                    >
                      {selectionCount}/{maxSelections}
                    </span>
                    {/* Mandatory badge */}
                    <span className="text-[10px] font-black uppercase text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      OBLIGATORIO
                    </span>
                  </div>
                </div>

                {/* Mitad y mitad status */}
                {selectionCount === 2 && (
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-amber-300 font-semibold">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      <strong>{PIZZA_FLAVORS.find((f) => f.id === currentPizza.primaryFlavorId)?.name}</strong>
                      {' / '}
                      <strong>{PIZZA_FLAVORS.find((f) => f.id === currentPizza.secondaryFlavorId)?.name}</strong>
                      {' — Mitad y Mitad ✓'}
                    </span>
                  </div>
                )}
                {selectionCount === 1 && (
                  <div className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/30 rounded-xl px-3 py-2 text-xs text-neutral-300">
                    <Check className="w-3.5 h-3.5 text-brand-primary" />
                    <span>
                      Pizza completa: <strong className="text-white">{PIZZA_FLAVORS.find((f) => f.id === currentPizza.primaryFlavorId)?.name}</strong>
                      {sizeDef.allowHalfAndHalf && (
                        <span className="text-amber-400 ml-1">· toca otro sabor para mitad y mitad</span>
                      )}
                    </span>
                  </div>
                )}

                {/* Flavor category tabs */}
                <div className="flex gap-1 bg-neutral-900/60 p-1 rounded-xl overflow-x-auto no-scrollbar">
                  {FLAVOR_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveFlavorTab(cat.id)}
                      className={`flex-1 min-w-max min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
                        activeFlavorTab === cat.id
                          ? 'bg-brand-primary text-white shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Flavor cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getFlavorsByCategory(activeFlavorTab).map((flavor) => {
                    const selected = isFlavorSelected(flavor.id);
                    const disabled = isFlavorDisabled(flavor.id);
                    const isPrimary = currentPizza.primaryFlavorId === flavor.id;
                    const isSecondary = currentPizza.secondaryFlavorId === flavor.id;

                    return (
                      <button
                        key={flavor.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleFlavor(activePizzaIndex, flavor.id)}
                        className={`min-h-[56px] p-3 rounded-xl border text-left flex items-start justify-between gap-2 transition-all active:scale-98 ${
                          selected
                            ? isPrimary && isSecondary
                              ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400'
                              : isPrimary
                              ? 'bg-brand-primary/20 border-brand-primary ring-1 ring-brand-primary'
                              : 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400'
                            : disabled
                            ? 'bg-neutral-900/30 border-surface-border opacity-40 cursor-not-allowed'
                            : 'bg-neutral-900/60 border-surface-border hover:bg-neutral-850 hover:border-neutral-600'
                        }`}
                        aria-pressed={selected}
                        aria-disabled={disabled}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-xs sm:text-sm text-white truncate">
                              {flavor.name}
                            </span>
                            {flavor.badge && (
                              <span className="bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex-shrink-0">
                                {flavor.badge}
                              </span>
                            )}
                            {isSecondary && (
                              <span className="bg-amber-500/30 text-amber-200 text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex-shrink-0">
                                2ª MITAD
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-400 block line-clamp-1 mt-0.5">
                            {flavor.ingredients.slice(0, 3).join(', ')}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-400 mt-0.5 block">
                            INCLUIDO
                          </span>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            selected
                              ? isSecondary
                                ? 'border-amber-400 bg-amber-400 text-neutral-950'
                                : 'border-brand-primary bg-brand-primary text-white'
                              : 'border-neutral-600 bg-neutral-950'
                          }`}
                        >
                          {selected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Fixed flavor for Combos Especiales */
              <div className="p-3 bg-neutral-900/60 rounded-xl border border-surface-border text-xs text-neutral-300">
                Sabor del combo especial:{' '}
                <strong className="text-amber-400">
                  {PIZZA_FLAVORS.find((f) => f.id === product.comboDetails?.fixedFlavorId)?.name}
                </strong>
              </div>
            )}

            {/* Crust selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-neutral-200 uppercase tracking-wider">
                  Borde relleno
                </label>
                <span className="text-[11px] text-amber-400">por pizza</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {CRUSTS_LIST.map((crust) => {
                  const crustPrice = getCrustPrice(crust.id, pizzaSizeId);
                  const isSelected = currentPizza.crustId === crust.id;

                  return (
                    <button
                      key={crust.id}
                      type="button"
                      onClick={() => {
                        updatePizza(activePizzaIndex, { crustId: crust.id as CrustTypeId });
                        if (crustPrice > 0) {
                          trackCrustSelected({
                            crustId: crust.id,
                            crustName: crust.name,
                            additionalCOP: crustPrice,
                          });
                        }
                      }}
                      className={`min-h-[52px] p-3 rounded-xl border text-left flex sm:flex-col justify-between gap-2 transition-all active:scale-98 ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400'
                          : 'bg-neutral-900/60 border-surface-border hover:bg-neutral-850'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-xs text-white line-clamp-1">{crust.name}</div>
                        <div className="text-[11px] text-neutral-400 line-clamp-1 hidden sm:block mt-0.5">
                          {crust.description}
                        </div>
                      </div>
                      <div className="font-mono font-black text-xs text-amber-400 whitespace-nowrap">
                        {crustPrice === 0 ? 'INCLUIDO' : `+${formatCOP(crustPrice)}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Extras */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-neutral-200 uppercase tracking-wider">
                  Ingredientes adicionales
                </label>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  currentPizza.extraIngredientIds.length >= siteConfig.commerce.maxExtrasPerPizza
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    : 'bg-neutral-900 border-surface-border text-neutral-300'
                }`}>
                  {currentPizza.extraIngredientIds.length}/{siteConfig.commerce.maxExtrasPerPizza}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EXTRA_INGREDIENTS.map((extra) => {
                  const extraPrice = getExtraPrice(extra.id, pizzaSizeId);
                  const isSelected = currentPizza.extraIngredientIds.includes(extra.id);
                  const isMaxed =
                    currentPizza.extraIngredientIds.length >= siteConfig.commerce.maxExtrasPerPizza && !isSelected;

                  return (
                    <button
                      key={extra.id}
                      type="button"
                      disabled={isMaxed}
                      onClick={() => toggleExtra(activePizzaIndex, extra.id)}
                      className={`min-h-[46px] p-2.5 rounded-xl border text-left flex items-center justify-between gap-1 transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-brand-primary/25 border-brand-primary ring-1 ring-brand-primary'
                          : isMaxed
                          ? 'opacity-40 cursor-not-allowed bg-neutral-900/40 border-surface-border'
                          : 'bg-neutral-900/60 border-surface-border hover:bg-neutral-850'
                      }`}
                    >
                      <span className="text-xs font-bold text-white line-clamp-1 truncate">{extra.name}</span>
                      <span className="text-[11px] font-mono font-black text-amber-400 whitespace-nowrap">
                        +{formatCOPShort(extraPrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  ¿Alguna observación? (opcional)
                </label>
                <span className="text-[10px] text-neutral-500">
                  {(currentPizza.notes || '').length}/{siteConfig.commerce.maxNotesLength}
                </span>
              </div>
              <textarea
                rows={2}
                placeholder="Ej. Masa bien tostada, sin orégano en la pizza 1..."
                maxLength={siteConfig.commerce.maxNotesLength}
                value={currentPizza.notes || ''}
                onChange={(e) => updatePizza(activePizzaIndex, { notes: e.target.value })}
                className="w-full bg-neutral-900 border border-surface-border rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:border-brand-primary resize-none"
              />
            </div>
          </div>

          {/* Drink selection — card-based, not dropdown */}
          {drinkCount > 0 && (
            <div className="bg-surface-card/90 border border-surface-border rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-neutral-100 uppercase tracking-wider">
                  Gaseosas ({drinkCount} x 1.5 L incluidas)
                </label>
                <span className="text-[10px] font-black uppercase text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                  OBLIGATORIO
                </span>
              </div>

              {selectedDrinks.map((currentDrinkId, idx) => (
                <div key={idx} className="space-y-1.5">
                  <span className="text-[11px] text-neutral-400 font-semibold">
                    Gaseosa {idx + 1} {!currentDrinkId && <span className="text-red-400 ml-1">· Elige una</span>}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {DRINKS_CATALOG.map((drink) => {
                      const isSelected = currentDrinkId === drink.id;
                      const drinkImage = drink.id === 'coca-cola-original-1-5l'
                        ? '/images/coca-cola-15.jpg'
                        : drink.id === 'colombiana-postobon-1-5l'
                        ? '/images/colombiana-15.jpg'
                        : null;

                      return (
                        <button
                          key={drink.id}
                          type="button"
                          onClick={() => {
                            const updated = [...selectedDrinks];
                            updated[idx] = drink.id;
                            setSelectedDrinks(updated);
                            setValidationError(null);
                          }}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all active:scale-98 ${
                            isSelected
                              ? 'bg-brand-primary/20 border-brand-primary ring-1 ring-brand-primary'
                              : 'bg-neutral-900/60 border-surface-border hover:bg-neutral-850'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0 relative">
                            {drinkImage ? (
                              <Image
                                src={drinkImage}
                                alt={drink.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">🥤</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-xs text-white block line-clamp-1">{drink.name}</span>
                            <span className="text-[10px] text-emerald-400 font-semibold">INCLUIDA</span>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                              isSelected
                                ? 'border-brand-primary bg-brand-primary'
                                : 'border-neutral-600'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Validation error */}
          {validationError && (
            <div className="flex items-start gap-2.5 p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Sticky CTA footer */}
        <div className="p-3.5 sm:p-5 border-t border-surface-border bg-surface-card/98 safe-bottom flex items-center justify-between gap-3 shadow-2xl flex-shrink-0">
          {/* Quantity */}
          <div className="flex items-center gap-1 bg-neutral-900 border border-surface-border rounded-xl p-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-neutral-800 text-neutral-300 active:scale-90 transition-all"
              aria-label="Restar"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-black text-sm text-white font-mono">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(q + 1, siteConfig.commerce.maxItemQuantity))}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-neutral-800 text-neutral-300 active:scale-90 transition-all"
              aria-label="Sumar"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to cart / disabled state */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={isAdding || !isValid}
            className={`flex-1 min-h-[52px] flex items-center justify-between px-4 sm:px-6 rounded-xl font-black text-sm sm:text-base shadow-glow active:scale-98 transition-all ${
              isValid
                ? 'bg-gradient-to-r from-brand-primary via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-75'
            }`}
            id="add-customized-pizza-btn"
          >
            <span>
              {isValid
                ? isEditing
                  ? 'ACTUALIZAR PEDIDO'
                  : 'AGREGAR AL PEDIDO'
                : 'ELIGE TUS SABORES'}
            </span>
            <span className={`font-mono font-extrabold text-sm ml-2 ${isValid ? 'text-amber-300' : 'text-neutral-500'}`}>
              {formatCOP(pricing.totalPriceCOP)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
