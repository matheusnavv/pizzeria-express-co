'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Check,
  Pizza,
  CupSoda,
  Plus,
  Minus,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Product, SinglePizzaConfig, PizzaSizeId, CrustTypeId } from '@/catalog/types';
import { PIZZA_SIZES } from '@/catalog/sizes';
import { PIZZA_FLAVORS } from '@/catalog/flavors';
import { CRUSTS_LIST, getCrustPrice } from '@/catalog/crusts';
import { EXTRA_INGREDIENTS, getExtraPrice } from '@/catalog/extras';
import { DRINKS_CATALOG } from '@/catalog/drinks';
import { calculateItemPrice, formatCOP } from '@/catalog/pricing';
import { siteConfig } from '@/config/siteConfig';
import { getProductImage } from '@/catalog/imageManifest';

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
}

export const ProductCustomizerModal: React.FC<ProductCustomizerModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  return (
    <ProductCustomizerModalInner
      product={product}
      onClose={onClose}
      onAddToCart={onAddToCart}
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
}

const ProductCustomizerModalInner: React.FC<InnerProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const isCombo = Boolean(product.isCombo && product.comboDetails);
  const pizzaCount = product.comboDetails?.pizzaCount ?? 1;
  const pizzaSizeId = product.comboDetails?.pizzaSizeId ?? 'mediana';
  const drinkCount = product.comboDetails?.drinkCount ?? 0;
  const sizeDef = PIZZA_SIZES[pizzaSizeId];

  // Initialize individual pizza configs
  const [pizzas, setPizzas] = useState<SinglePizzaConfig[]>(() => {
    const list: SinglePizzaConfig[] = [];
    for (let i = 0; i < pizzaCount; i++) {
      list.push({
        sizeId: pizzaSizeId,
        isHalfAndHalf: false,
        primaryFlavorId: product.comboDetails?.fixedFlavorId || PIZZA_FLAVORS[0].id,
        secondaryFlavorId: PIZZA_FLAVORS[1]?.id,
        crustId: 'traditional',
        extraIngredientIds: [],
        notes: '',
      });
    }
    return list;
  });

  // Selected drinks for combos
  const [selectedDrinks, setSelectedDrinks] = useState<string[]>(() => {
    const drinks: string[] = [];
    for (let i = 0; i < drinkCount; i++) {
      drinks.push(DRINKS_CATALOG[i % DRINKS_CATALOG.length].id);
    }
    return drinks;
  });

  const [quantity, setQuantity] = useState(1);
  const [activePizzaIndex, setActivePizzaIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  // Update specific pizza in state
  const updatePizza = (index: number, updates: Partial<SinglePizzaConfig>) => {
    setPizzas((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  // Toggle extra ingredient on active pizza
  const toggleExtra = (pizzaIndex: number, extraId: string) => {
    const currentExtras = pizzas[pizzaIndex].extraIngredientIds;
    const exists = currentExtras.includes(extraId);

    if (exists) {
      updatePizza(pizzaIndex, {
        extraIngredientIds: currentExtras.filter((id) => id !== extraId),
      });
    } else {
      if (currentExtras.length >= siteConfig.commerce.maxExtrasPerPizza) return;
      updatePizza(pizzaIndex, {
        extraIngredientIds: [...currentExtras, extraId],
      });
    }
  };

  // Calculate live item price
  const pricing = calculateItemPrice(product.id, quantity, {
    pizzas,
    selectedDrinkIds: selectedDrinks,
  });

  const handleAdd = () => {
    if (isAdding) return; // Prevent double taps
    setIsAdding(true);

    onAddToCart(product.id, quantity, {
      pizzas,
      selectedDrinkIds: selectedDrinks,
    });

    onClose();
  };

  const currentPizza = pizzas[activePizzaIndex];
  const imageUrl = getProductImage(product.image);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customizer-modal-title"
    >
      {/* Mobile Drawer / Bottom Sheet Container */}
      <div className="w-full sm:max-w-2xl h-[94vh] sm:h-auto sm:max-h-[90vh] bg-[#0E1522] border-t sm:border border-surface-border rounded-t-[28px] sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Mobile Drag Handle Bar */}
        <div className="w-full flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-neutral-600/60" />
        </div>

        {/* Top Header Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-surface-border flex items-center justify-between bg-surface-card/90">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-surface-border relative overflow-hidden flex-shrink-0">
              <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="40px" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block leading-none mb-1">
                Personaliza tu pedido
              </span>
              <h2 id="customizer-modal-title" className="text-base sm:text-lg font-black text-white truncate">
                {product.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors flex-shrink-0 active:scale-95"
            aria-label="Cerrar personalizador"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Designed Specifically for Mobile Thumbs */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 space-y-6">
          {/* Pizza Tabs if more than 1 pizza in combo */}
          {pizzaCount > 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-neutral-300 uppercase tracking-wider">
                  Configura tus {pizzaCount} Pizzas
                </span>
                <span className="text-[11px] text-amber-400 font-semibold">
                  Toca para cambiar de pizza
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {pizzas.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePizzaIndex(idx)}
                    className={`min-h-[48px] px-3 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-between border transition-all active:scale-95 ${
                      activePizzaIndex === idx
                        ? 'bg-brand-primary text-white border-brand-primary shadow-glow'
                        : 'bg-surface-card text-neutral-300 border-surface-border hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Pizza className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Pizza {idx + 1}</span>
                    </div>
                    {activePizzaIndex === idx && <Check className="w-4 h-4 flex-shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Pizza Config Card */}
          <div className="bg-surface-card/90 border border-surface-border rounded-2xl p-4 sm:p-5 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <span className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                <Pizza className="w-4 h-4 text-amber-400" />
                Pizza {activePizzaIndex + 1} de {pizzaCount}
              </span>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                {sizeDef.name} · {sizeDef.slices} porciones
              </span>
            </div>

            {/* 1. Mitad y Mitad Selection */}
            {sizeDef.allowHalfAndHalf && !product.comboDetails?.fixedFlavorId && (
              <div className="space-y-2">
                <label className="block text-xs font-black text-neutral-200 uppercase tracking-wider">
                  ¿La quieres de un solo sabor o mitad y mitad?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updatePizza(activePizzaIndex, { isHalfAndHalf: false })}
                    className={`min-h-[48px] p-3 rounded-xl text-left border flex items-center justify-between transition-all active:scale-98 ${
                      !currentPizza.isHalfAndHalf
                        ? 'bg-brand-primary/20 border-brand-primary text-white shadow-sm ring-1 ring-brand-primary/50'
                        : 'bg-neutral-900/70 border-surface-border text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-xs sm:text-sm block text-white">Un solo sabor</span>
                      <span className="text-[11px] text-neutral-400">Toda la pizza del mismo sabor</span>
                    </div>
                    {!currentPizza.isHalfAndHalf && <Check className="w-4 h-4 text-brand-primary flex-shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => updatePizza(activePizzaIndex, { isHalfAndHalf: true })}
                    className={`min-h-[48px] p-3 rounded-xl text-left border flex items-center justify-between transition-all active:scale-98 ${
                      currentPizza.isHalfAndHalf
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm ring-1 ring-amber-400/50'
                        : 'bg-neutral-900/70 border-surface-border text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-xs sm:text-sm block text-amber-300">
                        Mitad y Mitad
                      </span>
                      <span className="text-[11px] text-emerald-400 font-bold">¡Sin costo extra!</span>
                    </div>
                    {currentPizza.isHalfAndHalf && <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                  </button>
                </div>
              </div>
            )}

            {/* 2. Visual Flavor Cards (Replaces tiny dropdowns with big tap targets) */}
            {!product.comboDetails?.fixedFlavorId ? (
              <div className="space-y-4">
                {/* Flavor 1 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-neutral-200 uppercase tracking-wider">
                      {currentPizza.isHalfAndHalf ? '1. Primera Mitad de Sabor' : 'Elige el Sabor de la Pizza'}
                    </label>
                    <span className="text-[11px] text-amber-400 font-bold">
                      {PIZZA_FLAVORS.find((f) => f.id === currentPizza.primaryFlavorId)?.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PIZZA_FLAVORS.map((f) => {
                      const isSelected = currentPizza.primaryFlavorId === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => updatePizza(activePizzaIndex, { primaryFlavorId: f.id })}
                          className={`min-h-[52px] p-3 rounded-xl border text-left flex items-start justify-between gap-2 transition-all active:scale-98 ${
                            isSelected
                              ? 'bg-brand-primary/20 border-brand-primary text-white shadow-sm ring-1 ring-brand-primary'
                              : 'bg-neutral-900/60 border-surface-border text-neutral-300 hover:bg-neutral-850'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-xs sm:text-sm text-white truncate">
                                {f.name}
                              </span>
                              {f.badge && (
                                <span className="bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                                  {f.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-400 block line-clamp-1 mt-0.5">
                              {f.ingredients.join(', ')}
                            </span>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isSelected
                                ? 'border-brand-primary bg-brand-primary text-white'
                                : 'border-neutral-600 bg-neutral-950'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Flavor 2 if Half & Half */}
                {currentPizza.isHalfAndHalf && (
                  <div className="pt-2 border-t border-surface-border">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-black text-amber-300 uppercase tracking-wider">
                        2. Segunda Mitad de Sabor
                      </label>
                      <span className="text-[11px] text-amber-400 font-bold">
                        {
                          PIZZA_FLAVORS.find(
                            (f) => f.id === (currentPizza.secondaryFlavorId || PIZZA_FLAVORS[1].id)
                          )?.name
                        }
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PIZZA_FLAVORS.map((f) => {
                        const isSelected =
                          (currentPizza.secondaryFlavorId || PIZZA_FLAVORS[1].id) === f.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => updatePizza(activePizzaIndex, { secondaryFlavorId: f.id })}
                            className={`min-h-[52px] p-3 rounded-xl border text-left flex items-start justify-between gap-2 transition-all active:scale-98 ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm ring-1 ring-amber-400'
                                : 'bg-neutral-900/60 border-surface-border text-neutral-300 hover:bg-neutral-850'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="font-extrabold text-xs sm:text-sm text-white block truncate">
                                {f.name}
                              </span>
                              <span className="text-[11px] text-neutral-400 block line-clamp-1 mt-0.5">
                                {f.ingredients.join(', ')}
                              </span>
                            </div>

                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isSelected
                                  ? 'border-amber-400 bg-amber-400 text-neutral-950'
                                  : 'border-neutral-600 bg-neutral-950'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-neutral-900/60 rounded-xl border border-surface-border text-xs text-neutral-300">
                Sabor fijo de este combo especial:{' '}
                <strong className="text-amber-400 font-bold">
                  {PIZZA_FLAVORS.find((f) => f.id === product.comboDetails?.fixedFlavorId)?.name}
                </strong>
              </div>
            )}

            {/* 3. Stuffed Crust (Borde) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-neutral-200 uppercase tracking-wider">
                  Elige el Borde Relleno (Por Pizza)
                </label>
                <span className="text-[11px] text-amber-400 font-semibold">¡Sabor recomendado!</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {CRUSTS_LIST.map((crust) => {
                  const crustPrice = getCrustPrice(crust.id, pizzaSizeId);
                  const isSelected = currentPizza.crustId === crust.id;

                  return (
                    <button
                      key={crust.id}
                      type="button"
                      onClick={() => updatePizza(activePizzaIndex, { crustId: crust.id })}
                      className={`min-h-[50px] p-3 rounded-xl border text-left flex sm:flex-col justify-between transition-all active:scale-98 ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm ring-1 ring-amber-400'
                          : 'bg-neutral-900/60 border-surface-border text-neutral-300 hover:bg-neutral-850'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-xs sm:text-sm text-white line-clamp-1">
                          {crust.name}
                        </div>
                        <div className="text-[11px] text-neutral-400 line-clamp-1 hidden sm:block mt-0.5">
                          {crust.description}
                        </div>
                      </div>
                      <div className="font-mono font-black text-xs sm:text-sm text-amber-400 sm:mt-2">
                        {crustPrice === 0 ? 'Incluido' : `+${formatCOP(crustPrice)}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Extra Ingredients */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-neutral-200 uppercase tracking-wider">
                  Ingredientes adicionales
                </label>
                <span className="text-[11px] font-bold text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-surface-border">
                  {currentPizza.extraIngredientIds.length} de {siteConfig.commerce.maxExtrasPerPizza}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EXTRA_INGREDIENTS.map((extra) => {
                  const extraPrice = getExtraPrice(extra.id, pizzaSizeId);
                  const isSelected = currentPizza.extraIngredientIds.includes(extra.id);

                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(activePizzaIndex, extra.id)}
                      className={`min-h-[46px] p-2.5 rounded-xl border text-left flex items-center justify-between gap-1 transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-brand-primary/25 border-brand-primary text-white shadow-sm ring-1 ring-brand-primary'
                          : 'bg-neutral-900/60 border-surface-border text-neutral-300 hover:bg-neutral-850'
                      }`}
                    >
                      <span className="text-xs font-bold line-clamp-1 truncate">{extra.name}</span>
                      <span className="text-[11px] font-mono font-black text-amber-400 whitespace-nowrap">
                        +{formatCOP(extraPrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Notes for this specific pizza */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Observaciones de esta pizza (opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Masa bien tostada, sin orégano..."
                maxLength={siteConfig.commerce.maxNotesLength}
                value={currentPizza.notes || ''}
                onChange={(e) => updatePizza(activePizzaIndex, { notes: e.target.value })}
                className="w-full min-h-[44px] bg-neutral-900 border border-surface-border rounded-xl px-3.5 text-xs text-white placeholder-neutral-500 focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Drink Selection for Combos */}
          {drinkCount > 0 && (
            <div className="bg-surface-card/90 border border-surface-border rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
              <label className="block text-xs font-black text-neutral-200 uppercase tracking-wider">
                Selecciona tus bebidas ({drinkCount} {drinkCount === 1 ? 'gaseosa' : 'gaseosas'} 1.5 L)
              </label>
              <div className="space-y-2">
                {selectedDrinks.map((currentDrinkId, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-surface-border flex items-center justify-center text-red-400 flex-shrink-0">
                      <CupSoda className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[11px] text-neutral-400 block mb-0.5 font-semibold">
                        Gaseosa {idx + 1}
                      </span>
                      <select
                        value={currentDrinkId}
                        onChange={(e) => {
                          const newDrinks = [...selectedDrinks];
                          newDrinks[idx] = e.target.value;
                          setSelectedDrinks(newDrinks);
                        }}
                        className="w-full min-h-[44px] bg-neutral-900 border border-surface-border rounded-xl px-3 text-xs sm:text-sm text-white font-medium focus:border-brand-primary"
                      >
                        {DRINKS_CATALOG.map((drink) => (
                          <option key={drink.id} value={drink.id}>
                            {drink.name} (1.5 L)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Mobile Footer with Large Thumb CTA and Safe-Area Support */}
        <div className="p-3.5 sm:p-5 border-t border-surface-border bg-surface-card/98 safe-bottom flex items-center justify-between gap-3 shadow-2xl">
          {/* Quantity selector (Min 44x44px buttons) */}
          <div className="flex items-center gap-1 bg-neutral-900 border border-surface-border rounded-xl p-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-neutral-800 text-neutral-300 active:scale-90 transition-all"
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-black text-sm text-white font-mono">{quantity}</span>
            <button
              type="button"
              onClick={() =>
                setQuantity((q) => Math.min(q + 1, siteConfig.commerce.maxItemQuantity))
              }
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-neutral-800 text-neutral-300 active:scale-90 transition-all"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={isAdding}
            className="flex-1 min-h-[48px] sm:min-h-[52px] flex items-center justify-between bg-gradient-to-r from-brand-primary via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-black text-sm sm:text-base px-4 sm:px-6 rounded-xl shadow-glow active:scale-98 transition-all disabled:opacity-50"
            id="add-customized-pizza-btn"
          >
            <span>AGREGAR AL PEDIDO</span>
            <span className="font-mono text-amber-300 font-extrabold text-sm sm:text-base ml-2">
              {formatCOP(pricing.totalPriceCOP)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
