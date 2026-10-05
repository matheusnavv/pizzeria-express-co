/**
 * Centralized site configuration
 * All brand references, taglines, legal placeholders, contact details,
 * and operational settings are managed here.
 */

export interface OpeningHourRange {
  open: string; // "HH:MM" 24h
  close: string; // "HH:MM" 24h
}

export interface DaySchedule {
  isOpen: boolean;
  ranges: OpeningHourRange[];
}

export interface SiteConfig {
  brand: {
    name: string;
    shortName: string;
    tagline: string;
    description: string;
    logoText: string;
    logoIcon: string;
    logoUrl?: string;
    emblemUrl?: string;
    contact: {
      phone: string;
      email: string;
      displayPhone: string;
    };
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  commerce: {
    minOrderCOP: number;
    currency: "COP";
    currencySymbol: "$";
    freeDelivery: boolean;
    deliveryFeeCOP: number;
    deliveryHeadline: string;
    deliverySubtext: string;
    maxCartItems: number;
    maxItemQuantity: number;
    maxExtrasPerPizza: number;
    maxNotesLength: number;
  };
  schedule: {
    timezone: string; // "America/Bogota"
    weekdays: Record<number, DaySchedule>; // 0 = Sunday, 1 = Monday, ...
  };
  reviews: {
    enabled: boolean;
  };
  legal: {
    companyName: string;
    nit: string;
    address: string;
    email: string;
    city: string;
    country: string;
  };
}

export const siteConfig: SiteConfig = {
  brand: {
    name: "DeliPizza",
    shortName: "DeliPizza",
    tagline: "Pizza recién horneada, directo a tu puerta.",
    description: "Pide pizzas, super combos, bebidas y postres a domicilio en Colombia con DeliPizza. Personaliza con mitad y mitad, bordes de queso y paga al instante con Nequi o Bre-B.",
    logoText: "DeliPizza",
    logoIcon: "🍕",
    logoUrl: "/brand/delipizza-logo.png",
    emblemUrl: "/brand/delipizza-emblem.png",
    contact: {
      phone: "+573000000000",
      email: "contacto@delipizza.co",
      displayPhone: "300 000 0000",
    },
    colors: {
      primary: "#E53935", // DeliPizza Red
      secondary: "#FFB300", // Warm cheese gold
      accent: "#F97316", // Vibrant orange
    },
  },
  commerce: {
    minOrderCOP: 27900,
    currency: "COP",
    currencySymbol: "$",
    freeDelivery: true,
    deliveryFeeCOP: 0,
    deliveryHeadline: "DOMICILIO GRATIS",
    deliverySubtext: "Domicilios disponibles en tu zona según cobertura.",
    maxCartItems: 30,
    maxItemQuantity: 10,
    maxExtrasPerPizza: 5,
    maxNotesLength: 140,
  },
  schedule: {
    timezone: "America/Bogota",
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    weekdays: {
      0: { isOpen: true, ranges: [{ open: "11:30", close: "23:00" }] },
      1: { isOpen: true, ranges: [{ open: "11:30", close: "23:00" }] },
      2: { isOpen: true, ranges: [{ open: "11:30", close: "23:00" }] },
      3: { isOpen: true, ranges: [{ open: "11:30", close: "23:00" }] },
      4: { isOpen: true, ranges: [{ open: "11:30", close: "23:30" }] },
      5: { isOpen: true, ranges: [{ open: "11:30", close: "23:59" }] },
      6: { isOpen: true, ranges: [{ open: "11:30", close: "23:59" }] },
    },
  },
  reviews: {
    enabled: false, // Default production: false. Only fixtures in dev.
  },
  legal: {
    companyName: "LEGAL_COMPANY_NAME",
    nit: "LEGAL_NIT",
    address: "LEGAL_ADDRESS",
    email: "LEGAL_EMAIL",
    city: "Colombia",
    country: "Colombia",
  },
};
