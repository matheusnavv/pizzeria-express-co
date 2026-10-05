import { PRODUCTS } from '@/lib/products';

let savedLeads = [];
let savedOrders = [];

try {
  if (typeof window !== 'undefined') {
    const cachedOrders = localStorage.getItem('b44_orders');
    if (cachedOrders) savedOrders = JSON.parse(cachedOrders);
    const cachedLeads = localStorage.getItem('b44_leads');
    if (cachedLeads) savedLeads = JSON.parse(cachedLeads);
  }
} catch (_) {}

export const db = {
  auth: {
    isAuthenticated: async () => false,
    me: async () => null,
  },
  entities: {
    Product: {
      filter: async (query = {}, options = {}) => {
        let items = [...PRODUCTS];
        if (query && query.category) {
          items = items.filter((p) => p.category === query.category);
        }
        if (options && options.limit) {
          items = items.slice(0, options.limit);
        }
        return { items, total: items.length };
      },
      get: async (id) => PRODUCTS.find((p) => p.id === id) || null,
      create: async (data) => ({ id: `prod-${Date.now()}`, ...data }),
      update: async (id, data) => ({ id, ...data }),
      delete: async () => true,
    },
    Lead: {
      create: async (lead) => {
        const item = { id: `lead-${Date.now()}`, created_date: new Date().toISOString(), ...lead };
        savedLeads.push(item);
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('b44_leads', JSON.stringify(savedLeads));
          }
        } catch (_) {}
        return item;
      },
      filter: async () => ({ items: savedLeads }),
    },
    Order: {
      create: async (order) => {
        const item = {
          id: `ord-${Date.now()}`,
          created_date: new Date().toISOString(),
          status: 'pending',
          ...order,
        };
        savedOrders.unshift(item);
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('b44_orders', JSON.stringify(savedOrders));
          }
        } catch (_) {}
        return item;
      },
      filter: async () => ({ items: savedOrders }),
    },
    User: {
      filter: async () => ({ items: [] }),
      get: async () => null,
    },
  },
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: '' }),
    },
  },
};

globalThis.__B44_DB__ = db;
export const base44 = db;
export default db;