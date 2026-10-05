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

export function trackPageView(): void {
  if (!canTrack()) return;
  try {
    window.fbq?.('track', 'PageView');
  } catch (err) {
    console.debug('[MetaPixel] PageView error:', err);
  }
}

export function trackViewContent(item: {
  id: string;
  name: string;
  priceCOP: number;
  category?: string;
}): void {
  if (!canTrack()) return;
  try {
    window.fbq?.('track', 'ViewContent', {
      content_ids: [item.id],
      content_name: item.name,
      content_category: item.category || 'Pizzas',
      content_type: 'product',
      value: item.priceCOP,
      currency: 'COP',
    });
  } catch (err) {
    console.debug('[MetaPixel] ViewContent error:', err);
  }
}

export function trackAddToCart(item: {
  id: string;
  name: string;
  priceCOP: number;
  quantity: number;
}): void {
  if (!canTrack()) return;
  try {
    window.fbq?.('track', 'AddToCart', {
      content_ids: [item.id],
      content_name: item.name,
      content_type: 'product',
      value: item.priceCOP * item.quantity,
      currency: 'COP',
      num_items: item.quantity,
    });
  } catch (err) {
    console.debug('[MetaPixel] AddToCart error:', err);
  }
}

export function trackInitiateCheckout(data: {
  value: number;
  numItems: number;
  contentIds: string[];
}): void {
  if (!canTrack()) return;
  try {
    window.fbq?.('track', 'InitiateCheckout', {
      value: data.value,
      currency: 'COP',
      num_items: data.numItems,
      content_ids: data.contentIds,
    });
  } catch (err) {
    console.debug('[MetaPixel] InitiateCheckout error:', err);
  }
}

export function trackAddPaymentInfo(data: {
  value: number;
  paymentMethod: string;
}): void {
  if (!canTrack()) return;
  try {
    window.fbq?.('track', 'AddPaymentInfo', {
      value: data.value,
      currency: 'COP',
      payment_method: data.paymentMethod,
    });
  } catch (err) {
    console.debug('[MetaPixel] AddPaymentInfo error:', err);
  }
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
    // Already tracked for this order
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
