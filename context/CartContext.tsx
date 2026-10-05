'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, CartPricingSummary, ItemCustomization } from '@/catalog/types';
import { PRODUCTS_MAP } from '@/catalog/products';
import { calculateItemPrice, calculateOrderPricing } from '@/catalog/pricing';
import { siteConfig } from '@/config/siteConfig';
import { trackAddToCart } from '@/lib/analytics/meta';

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, quantity: number, customization?: ItemCustomization) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  pricingSummary: CartPricingSummary;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'pizzeria_express_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed: CartItem[] = JSON.parse(stored);
        // Re-validate and recalculate each item based on current catalog
        const validatedItems: CartItem[] = [];
        for (const item of parsed) {
          const product = PRODUCTS_MAP.get(item.productId);
          if (product) {
            const pricing = calculateItemPrice(item.productId, item.quantity, item.customization);
            validatedItems.push({
              ...item,
              unitPriceCOP: pricing.unitPriceCOP,
              totalPriceCOP: pricing.totalPriceCOP,
              name: product.name,
              image: product.image,
            });
          }
        }
        setItems(validatedItems);
      }
    } catch (e) {
      console.error('Error loading cart from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [items, isLoaded]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = (productId: string, quantity: number, customization?: ItemCustomization) => {
    const product = PRODUCTS_MAP.get(productId);
    if (!product) return;

    const safeQty = Math.max(1, Math.min(quantity, siteConfig.commerce.maxItemQuantity));
    const pricing = calculateItemPrice(productId, safeQty, customization);

    const newItem: CartItem = {
      cartItemId: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      productId,
      quantity: safeQty,
      customization,
      unitPriceCOP: pricing.unitPriceCOP,
      totalPriceCOP: pricing.totalPriceCOP,
      name: product.name,
      image: product.image,
    };

    setItems((prev) => {
      // If simple item without customization (e.g. drink, side), try grouping
      if (!customization?.pizzas || customization.pizzas.length === 0) {
        const existingIndex = prev.findIndex(
          (i) => i.productId === productId && (!i.customization?.pizzas || i.customization.pizzas.length === 0)
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          const newQty = Math.min(
            updated[existingIndex].quantity + safeQty,
            siteConfig.commerce.maxItemQuantity
          );
          const updatedPricing = calculateItemPrice(productId, newQty, customization);
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
            unitPriceCOP: updatedPricing.unitPriceCOP,
            totalPriceCOP: updatedPricing.totalPriceCOP,
          };
          return updated;
        }
      }
      return [...prev, newItem].slice(0, siteConfig.commerce.maxCartItems);
    });

    // Track Meta Pixel AddToCart
    trackAddToCart({
      id: productId,
      name: product.name,
      priceCOP: pricing.unitPriceCOP,
      quantity: safeQty,
    });

    openCart();
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    const safeQty = Math.min(quantity, siteConfig.commerce.maxItemQuantity);

    setItems((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const pricing = calculateItemPrice(item.productId, safeQty, item.customization);
          return {
            ...item,
            quantity: safeQty,
            unitPriceCOP: pricing.unitPriceCOP,
            totalPriceCOP: pricing.totalPriceCOP,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const orderPricing = calculateOrderPricing(
    items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      customization: i.customization,
    }))
  );

  const pricingSummary: CartPricingSummary = {
    subtotalCOP: orderPricing.subtotalCOP,
    deliveryFeeCOP: orderPricing.deliveryFeeCOP,
    totalCOP: orderPricing.totalCOP,
    isMinOrderMet: orderPricing.isMinOrderMet,
    minOrderRequiredCOP: orderPricing.minOrderRequiredCOP,
    itemCount: orderPricing.totalItemCount,
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        pricingSummary,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe utilizarse dentro de un CartProvider');
  }
  return context;
};
