/**
 * Delivery options configuration.
 * Mirrors the backup's "Entrega Grátis / Entrega Rápida" mechanic.
 * Set priorityEnabled: false to hide the priority option (e.g. not yet operational).
 */

export interface DeliveryOption {
  id: 'standard' | 'priority';
  label: string;
  description: string;
  priceCOP: number;
  badge?: string;
}

export interface DeliveryConfig {
  /** Show priority delivery option in checkout */
  priorityEnabled: boolean;
  options: DeliveryOption[];
}

export const deliveryConfig: DeliveryConfig = {
  priorityEnabled: true, // Set false to hide priority option until operationally ready
  options: [
    {
      id: 'standard',
      label: 'Domicilio Estándar',
      description: 'De 40 a 60 min',
      priceCOP: 0,
      badge: 'GRATIS',
    },
    {
      id: 'priority',
      label: 'Domicilio Prioritario',
      description: 'De 20 a 30 min',
      priceCOP: 8900,
    },
  ],
};
