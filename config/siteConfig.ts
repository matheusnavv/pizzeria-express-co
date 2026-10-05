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
    name: "Pizzería Express",
    shortName: "Express",
    tagline: "Pizza recién horneada, directo a tu puerta.",
    description: "Pide pizzas, combos, bebidas y acompañamientos a domicilio en Colombia. Personaliza tu pizza con bordes rellenos, mitad y mitad e ingredientes adicionales. Paga fácil con Nequi o Bre-B.",
    logoText: "Pizzería Express",
    logoIcon: "🍕",
    contact: {
      phone: "+573000000000",
      email: "contacto@pizzeriaexpress.co",
      displayPhone: "300 000 0000",
    },
    colors: {
      primary: "#E53935", // Vibrant pizza red
      secondary: "#FFB300", // Warm melted cheese gold
      accent: "#43A047", // Fresh basil green
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
    maxNotesLength: 500,
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
