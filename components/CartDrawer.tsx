'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, AlertCircle, ShoppingBag, ArrowRight, Pizza } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCOP } from '@/catalog/pricing';
import { siteConfig } from '@/config/siteConfig';
import { SIDES_CATALOG } from '@/catalog/sides';
import { DESSERTS_CATALOG } from '@/catalog/desserts';
import { DRINKS_CATALOG } from '@/catalog/drinks';
import { PIZZA_FLAVORS } from '@/catalog/flavors';
import { CRUST_OPTIONS } from '@/catalog/crusts';
import { EXTRA_INGREDIENTS } from '@/catalog/extras';
import { PIZZA_SIZES } from '@/catalog/sizes';
import { getProductImage } from '@/catalog/imageManifest';

export const CartDrawer: React.FC = () => {
  const { items, isCartOpen, closeCart, updateQuantity, removeItem, addItem, pricingSummary } =
    useCart();

  if (!isCartOpen) return null;

  // Cross-sell items (Pan de Ajo, Dedos de Queso, Gaseosa Colombiana, Brownie)
  const crossSellProducts = [
    SIDES_CATALOG[0], // Pan de Ajo
    SIDES_CATALOG[1], // Dedos de Queso
    DRINKS_CATALOG[2], // Colombiana Postobon
    DESSERTS_CATALOG[3], // Brownie de Chocolate
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      <div className="w-full max-w-md h-full bg-[#121926] border-l border-surface-border flex flex-col shadow-2xl animate-slide-up sm:animate-none">
        {/* Cart Header */}
        <div className="p-4 sm:p-5 border-b border-surface-border flex items-center justify-between bg-surface-card">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cart-drawer-title" className="text-lg font-black text-white">
                Tu Pedido
              </h2>
              <span className="text-xs text-neutral-400">
                {pricingSummary.itemCount}{' '}
                {pricingSummary.itemCount === 1 ? 'producto' : 'productos'}
              </span>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-surface-card flex items-center justify-center text-neutral-500">
                <Pizza className="w-8 h-8" />
              </div>
              <p className="text-neutral-400 text-sm">Tu carrito de pizzas está vacío.</p>
              <button
                onClick={closeCart}
                className="bg-brand-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-glow"
              >
                Ver Menú y Combos
              </button>
            </div>
          ) : (
            items.map((item) => {
              const imageUrl = getProductImage(item.image);

              return (
                <div
                  key={item.cartItemId}
                  className="bg-surface-card/80 border border-surface-border rounded-2xl p-4 flex flex-col gap-3"
                >
                  <div className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-sm text-white line-clamp-1">{item.name}</h4>
                        <span className="font-mono font-bold text-sm text-amber-400 whitespace-nowrap">
                          {formatCOP(item.totalPriceCOP)}
                        </span>
                      </div>

                      {/* Customization Details */}
                      {item.customization?.pizzas && item.customization.pizzas.length > 0 && (
                        <div className="mt-2 space-y-1.5 text-xs text-neutral-300 bg-neutral-900/60 p-2.5 rounded-lg border border-surface-border/50">
                          {item.customization.pizzas.map((pizza, pIdx) => {
                            const size = PIZZA_SIZES[pizza.sizeId];
                            const flavor1 = PIZZA_FLAVORS.find((f) => f.id === pizza.primaryFlavorId);
                            const flavor2 = pizza.secondaryFlavorId
                              ? PIZZA_FLAVORS.find((f) => f.id === pizza.secondaryFlavorId)
                              : null;
                            const crust = CRUST_OPTIONS[pizza.crustId];
                            const extrasNames = (pizza.extraIngredientIds || [])
                              .map((id) => EXTRA_INGREDIENTS.find((e) => e.id === id)?.name)
                              .filter(Boolean);

                            return (
                              <div key={pIdx} className="border-b border-white/5 pb-1 last:border-0 last:pb-0">
                                <span className="font-bold text-amber-300 block">
                                  Pizza {pIdx + 1} ({size?.name || pizza.sizeId}):
                                </span>
                                <div className="text-[11px] text-neutral-300 pl-1">
                                  {pizza.isHalfAndHalf && flavor2 ? (
                                    <span>
                                      Mitad: <strong>{flavor1?.name}</strong> / Mitad:{' '}
                                      <strong>{flavor2?.name}</strong>
                                    </span>
                                  ) : (
                                    <span>
                                      Sabor: <strong>{flavor1?.name || pizza.primaryFlavorId}</strong>
                                    </span>
                                  )}
                                  {crust && crust.id !== 'traditional' && (
                                    <span className="block text-amber-400 font-medium">
                                      + {crust.name}
                                    </span>
                                  )}
                                  {extrasNames.length > 0 && (
                                    <span className="block text-emerald-400 font-medium">
                                      + Extras: {extrasNames.join(', ')}
                                    </span>
                                  )}
                                  {pizza.notes && (
                                    <span className="block text-neutral-400 italic">
                                      Nota: {pizza.notes}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* Selected Drinks */}
                          {item.customization.selectedDrinkIds &&
                            item.customization.selectedDrinkIds.length > 0 && (
                              <div className="pt-1 border-t border-white/5 text-[11px] text-neutral-300">
                                <span className="font-semibold text-red-400">Bebidas: </span>
                                {item.customization.selectedDrinkIds
                                  .map((dId) => DRINKS_CATALOG.find((d) => d.id === dId)?.name)
                                  .filter(Boolean)
                                  .join(', ')}
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Delete Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-surface-border/50">
                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      className="text-neutral-400 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
                      aria-label="Eliminar producto del carrito"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar</span>
                    </button>

                    <div className="flex items-center gap-2 bg-neutral-900 border border-surface-border rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-neutral-800 text-neutral-300"
                        aria-label="Restar uno"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-bold text-xs text-white font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-neutral-800 text-neutral-300"
                        aria-label="Sumar uno"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Cross-Sell Section: Completa tu pedido */}
          {items.length > 0 && (
            <div className="pt-4 border-t border-surface-border">
              <span className="block text-xs font-extrabold text-neutral-300 uppercase tracking-wider mb-3">
                Completa tu pedido (1 toque)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {crossSellProducts.map((cross) => (
                  <button
                    key={cross.id}
                    type="button"
                    onClick={() => addItem(cross.id, 1)}
                    className="p-2.5 bg-neutral-900/70 hover:bg-surface-hover border border-surface-border rounded-xl text-left flex flex-col justify-between transition-all group"
                  >
                    <div>
                      <span className="font-bold text-xs text-white group-hover:text-amber-300 line-clamp-1">
                        {cross.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 block line-clamp-1">
                        {'portion' in cross ? cross.portion : cross.volume}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {formatCOP(cross.priceCOP)}
                      </span>
                      <span className="text-[10px] font-bold text-brand-primary group-hover:underline">
                        + Agregar
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout CTA */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-surface-border bg-surface-card space-y-3 safe-bottom">
            <div className="space-y-1.5 text-xs text-neutral-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-white">
                  {formatCOP(pricingSummary.subtotalCOP)}
                </span>
              </div>
              <div className="flex justify-between items-center text-emerald-400">
                <span>Domicilio</span>
                <span className="font-semibold uppercase tracking-wider text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {siteConfig.commerce.deliveryHeadline}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-surface-border">
                <span>Total a pagar</span>
                <span className="font-mono text-amber-400">
                  {formatCOP(pricingSummary.totalCOP)}
                </span>
              </div>
            </div>

            {/* Minimum Order Warning */}
            {!pricingSummary.isMinOrderMet && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300 animate-pulse">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Pedido mínimo $27.900 COP</span>
                  Te faltan{' '}
                  <strong className="font-mono text-white">
                    {formatCOP(pricingSummary.minOrderRequiredCOP - pricingSummary.subtotalCOP)}
                  </strong>{' '}
                  para completar el monto mínimo y poder enviar tu pedido.
                </div>
              </div>
            )}

            {/* Checkout Button */}
            {pricingSummary.isMinOrderMet ? (
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-glow active:scale-95 transition-all"
                id="cart-continue-checkout-btn"
              >
                <span>CONTINUAR CON EL PEDIDO</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <button
                disabled
                className="w-full bg-neutral-800 text-neutral-500 font-bold text-sm py-3.5 px-6 rounded-xl cursor-not-allowed text-center"
              >
                PEDIDO MÍNIMO $27.900
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
