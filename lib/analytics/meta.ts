/**
 * Centralized Meta Pixel Analytics Client
 * Gracefully handles missing pixel ID, consent preferences, and deduplication.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function getMetaPixelId(): string {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
}

const PURCHASE_RECORDED_KEY_PREFIX = 'pizzeria_purchase_tracked_';
const UPSELL_RECORDED_KEY_PREFIX = 'pizzeria_upsell_tracked_';

/**
 * Checks if Meta Pixel is initialized and consent is granted
 */
function canTrack(): boolean {
  if (typeof window === 'undefined') return false;
  const pixelId = getMetaPixelId();
  if (!pixelId) return false;

  // Check consent from localStorage if set
  const consent = typeof localStorage !== 'undefined' ? localStorage.getItem('cookie_consent_analytics') : null;
  if (consent === 'denied') return false;

  return typeof window.fbq === 'function';
}

function safeTrack(eventName: string, params?: Record<string, unknown>): void {
  if (!canTrack()) return;
  try {
    window.fbq?.('track', eventName, params);
  } catch (err) {
    console.debug(`[MetaPixel] ${eventName} error:`, err);
  }
}

function safeTrackCustom(eventName: string, params?: Record<string, unknown>): void {
  if (!canTrack()) return;
  try {
    window.fbq?.('trackCustom', eventName, params);
  } catch (err) {
    console.debug(`[MetaPixel] custom:${eventName} error:`, err);
  }
}

// ─── Standard Events ────────────────────────────────────────────────────────

export function trackPageView(): void {
  safeTrack('PageView');
}

export function trackViewContent(item: {
  id: string;
  name: string;
  priceCOP: number;
  category?: string;
}): void {
  safeTrack('ViewContent', {
    content_ids: [item.id],
    content_name: item.name,
    content_category: item.category || 'Pizzas',
    content_type: 'product',
    value: item.priceCOP,
    currency: 'COP',
  });
}

export function trackAddToCart(item: {
  id: string;
  name: string;
  priceCOP: number;
  quantity: number;
}): void {
  safeTrack('AddToCart', {
    content_ids: [item.id],
    content_name: item.name,
    content_type: 'product',
    value: item.priceCOP * item.quantity,
    currency: 'COP',
    num_items: item.quantity,
  });
}

export function trackInitiateCheckout(data: {
  value: number;
  numItems: number;
  contentIds: string[];
}): void {
  safeTrack('InitiateCheckout', {
    value: data.value,
    currency: 'COP',
    num_items: data.numItems,
    content_ids: data.contentIds,
  });
}

export function trackAddPaymentInfo(data: {
  value: number;
  paymentMethod: string;
}): void {
  safeTrack('AddPaymentInfo', {
    value: data.value,
    currency: 'COP',
    payment_method: data.paymentMethod,
  });
}

/**
 * Purchase event:
 * CRITICAL RULE: Fired ONLY after server-side payment confirmation is verified (paid).
 * Includes deduplication via localStorage so page refreshes never fire duplicate events.
 */
export function trackPurchase(data: {
  orderPublicCode: string;
  value: number;
  contentIds: string[];
  numItems: number;
}): boolean {
  if (!canTrack()) return false;
  if (!data.orderPublicCode) return false;

  const storageKey = `${PURCHASE_RECORDED_KEY_PREFIX}${data.orderPublicCode}`;
  if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) {
    return false;
  }

  try {
    window.fbq?.('track', 'Purchase', {
      value: data.value,
      currency: 'COP',
      content_ids: data.contentIds,
      num_items: data.numItems,
      order_id: data.orderPublicCode,
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
    return true;
  } catch (err) {
    console.debug('[MetaPixel] Purchase error:', err);
    return false;
  }
}

// ─── CRO Custom Events ──────────────────────────────────────────────────────

/** Fired when user opens the product configurator */
export function trackCustomizerStarted(data: { productId: string; productName: string }): void {
  safeTrackCustom('CustomizerStarted', {
    content_id: data.productId,
    content_name: data.productName,
    currency: 'COP',
  });
}

/** Fired when user selects a flavor tab in the configurator */
export function trackFlavorSelected(data: {
  flavorId: string;
  flavorName: string;
  pizzaIndex: number;
  isHalfAndHalf: boolean;
}): void {
  safeTrackCustom('FlavorSelected', {
    flavor_id: data.flavorId,
    flavor_name: data.flavorName,
    pizza_index: data.pizzaIndex,
    is_half_and_half: data.isHalfAndHalf,
  });
}

/** Fired when user selects mitad y mitad */
export function trackHalfAndHalfSelected(data: {
  flavorA: string;
  flavorB: string;
}): void {
  safeTrackCustom('HalfAndHalfSelected', {
    flavor_a: data.flavorA,
    flavor_b: data.flavorB,
  });
}

/** Fired when user selects a stuffed crust */
export function trackCrustSelected(data: {
  crustId: string;
  crustName: string;
  additionalCOP: number;
}): void {
  safeTrackCustom('CrustSelected', {
    crust_id: data.crustId,
    crust_name: data.crustName,
    additional_cop: data.additionalCOP,
  });
}

/** Fired when user adds an extra ingredient */
export function trackExtraSelected(data: {
  extraId: string;
  extraName: string;
  priceCOP: number;
}): void {
  safeTrackCustom('ExtraSelected', {
    extra_id: data.extraId,
    extra_name: data.extraName,
    price_cop: data.priceCOP,
  });
}

/** Fired when the cart cross-sell section is visible */
export function trackCrossSellViewed(items: string[]): void {
  safeTrackCustom('CrossSellViewed', { item_ids: items });
}

/** Fired when a cross-sell item is accepted (one-tap add) */
export function trackCrossSellAccepted(data: {
  productId: string;
  productName: string;
  priceCOP: number;
}): void {
  safeTrackCustom('CrossSellAccepted', {
    content_id: data.productId,
    content_name: data.productName,
    value: data.priceCOP,
    currency: 'COP',
  });
}

/** Fired when order bump section is visible in checkout */
export function trackOrderBumpViewed(bumps: string[]): void {
  safeTrackCustom('OrderBumpViewed', { bump_ids: bumps });
}

/** Fired when a checkout order bump is accepted */
export function trackOrderBumpAccepted(data: {
  bumpId: string;
  productId: string;
  productName: string;
  priceCOP: number;
}): void {
  safeTrackCustom('OrderBumpAccepted', {
    bump_id: data.bumpId,
    content_id: data.productId,
    content_name: data.productName,
    value: data.priceCOP,
    currency: 'COP',
  });
}

/** Fired when a post-purchase upsell offer is shown */
export function trackUpsellViewed(data: {
  offerId: string;
  sequence: number;
  productId: string;
  offerPriceCOP: number;
}): void {
  safeTrackCustom('UpsellViewed', {
    offer_id: data.offerId,
    sequence: data.sequence,
    content_id: data.productId,
    value: data.offerPriceCOP,
    currency: 'COP',
  });
}

/** Fired when user accepts a post-purchase upsell (before payment) */
export function trackUpsellAccepted(data: {
  offerId: string;
  sequence: number;
  productId: string;
  offerPriceCOP: number;
}): void {
  safeTrackCustom('UpsellAccepted', {
    offer_id: data.offerId,
    sequence: data.sequence,
    content_id: data.productId,
    value: data.offerPriceCOP,
    currency: 'COP',
  });
}

/** Fired when user declines a post-purchase upsell */
export function trackUpsellDeclined(data: {
  offerId: string;
  sequence: number;
}): void {
  safeTrackCustom('UpsellDeclined', {
    offer_id: data.offerId,
    sequence: data.sequence,
  });
}

/**
 * Upsell Purchase: deduplication-protected purchase event for post-purchase upsells.
 */
export function trackUpsellPurchase(data: {
  orderPublicCode: string;
  offerId: string;
  sequence: number;
  value: number;
  productId: string;
}): boolean {
  if (!canTrack()) return false;

  const storageKey = `${UPSELL_RECORDED_KEY_PREFIX}${data.orderPublicCode}_${data.offerId}`;
  if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) {
    return false;
  }

  try {
    window.fbq?.('trackCustom', 'UpsellPurchase', {
      offer_id: data.offerId,
      sequence: data.sequence,
      value: data.value,
      currency: 'COP',
      content_ids: [data.productId],
      order_id: data.orderPublicCode,
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
    return true;
  } catch (err) {
    console.debug('[MetaPixel] UpsellPurchase error:', err);
    return false;
  }
}

/** Fired when the complete order is confirmed (after all upsells) */
export function trackOrderConfirmed(data: {
  orderPublicCode: string;
  totalCOP: number;
  mainCOP: number;
  upsellCOP: number;
}): void {
  safeTrackCustom('OrderConfirmed', {
    order_id: data.orderPublicCode,
    total_value: data.totalCOP,
    main_value: data.mainCOP,
    upsell_value: data.upsellCOP,
    currency: 'COP',
  });
}

/** Fired when payment is initiated (XPAG checkout opened) */
export function trackPaymentStarted(data: {
  orderPublicCode: string;
  value: number;
  method: string;
}): void {
  safeTrackCustom('PaymentStarted', {
    order_id: data.orderPublicCode,
    value: data.value,
    currency: 'COP',
    payment_method: data.method,
  });
}

/** Fired when user selects a drink in combo customizer */
export function trackDrinkSelected(data: { drinkId: string; drinkName: string }): void {
  safeTrackCustom('DrinkSelected', {
    drink_id: data.drinkId,
    drink_name: data.drinkName,
  });
}

/** Fired when cart drawer/modal is opened */
export function trackViewCart(): void {
  safeTrackCustom('ViewCart');
}

/** Fired when user selects priority delivery */
export function trackDeliveryUpgradeSelected(data: { optionId: string; feeCOP: number }): void {
  safeTrackCustom('DeliveryUpgradeSelected', {
    option_id: data.optionId,
    fee_cop: data.feeCOP,
    currency: 'COP',
  });
}

export function trackUpsellComboViewed(data?: Record<string, unknown>): void {
  safeTrackCustom('UpsellComboViewed', data);
}

export function trackUpsellComboAccepted(data?: Record<string, unknown>): void {
  safeTrackCustom('UpsellComboAccepted', data);
}

export function trackUP1Viewed(data?: Record<string, unknown>): void {
  safeTrackCustom('UP1Viewed', data);
}

export function trackUP1Paid(data?: Record<string, unknown>): void {
  safeTrackCustom('UP1Paid', data);
}

export function trackUP2Viewed(data?: Record<string, unknown>): void {
  safeTrackCustom('UP2Viewed', data);
}

export function trackUP2Paid(data?: Record<string, unknown>): void {
  safeTrackCustom('UP2Paid', data);
}

export function trackUP3Viewed(data?: Record<string, unknown>): void {
  safeTrackCustom('UP3Viewed', data);
}

export function trackUP3Paid(data?: Record<string, unknown>): void {
  safeTrackCustom('UP3Paid', data);
}

export function trackUP4Viewed(data?: Record<string, unknown>): void {
  safeTrackCustom('UP4Viewed', data);
}

export function trackUP4Paid(data?: Record<string, unknown>): void {
  safeTrackCustom('UP4Paid', data);
}

export function trackOrderCompleted(data: Record<string, unknown>): void {
  safeTrackCustom('OrderCompleted', data);
}

