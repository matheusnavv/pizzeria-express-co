import { z } from 'zod';
import { siteConfig } from '../../config/siteConfig';

/**
 * Colombian mobile number normalization and validation:
 * Must be 10 digits starting with '3' (e.g. 3001234567, 310..., 320...).
 */
export const colombianPhoneSchema = z
  .string()
  .transform((val) => {
    const digits = val.replace(/\D/g, '');
    if (digits.startsWith('57') && digits.length === 12) {
      return digits.slice(2);
    }
    return digits;
  })
  .refine((val) => /^3\d{9}$/.test(val), {
    message: 'El número celular debe tener 10 dígitos y comenzar con 3 (ej. 3001234567).',
  });

export const singlePizzaConfigSchema = z.object({
  sizeId: z.enum(['personal', 'mediana', 'familiar', 'gigante', 'extragrande']),
  isHalfAndHalf: z.boolean(),
  primaryFlavorId: z.string().min(1, 'Debes seleccionar un sabor principal'),
  secondaryFlavorId: z.string().optional(),
  crustId: z.enum(['traditional', 'cheese', 'cheese_bocadillo']).default('traditional'),
  extraIngredientIds: z.array(z.string()).max(siteConfig.commerce.maxExtrasPerPizza).default([]),
  notes: z.string().max(siteConfig.commerce.maxNotesLength).optional(),
});

export const itemCustomizationSchema = z.object({
  pizzas: z.array(singlePizzaConfigSchema).optional(),
  selectedDrinkIds: z.array(z.string()).optional(),
  customerNotes: z.string().max(siteConfig.commerce.maxNotesLength).optional(),
});

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'ID de producto requerido'),
  quantity: z.number().int().min(1).max(siteConfig.commerce.maxItemQuantity),
  customization: itemCustomizationSchema.optional(),
});

export const createOrderInputSchema = z.object({
  customerName: z.string().trim().min(3, 'Ingresa tu nombre completo (mínimo 3 caracteres)').max(100),
  phone: colombianPhoneSchema,
  department: z.string().trim().min(2, 'Ingresa el departamento').max(60),
  city: z.string().trim().min(2, 'Ingresa la ciudad o municipio').max(60),
  barrio: z.string().trim().min(2, 'Ingresa el barrio').max(80),
  address: z.string().trim().min(5, 'Ingresa la dirección exacta (calle, carrera, número)').max(150),
  complement: z.string().trim().max(100).optional().or(z.literal('')),
  deliveryReference: z.string().trim().max(150).optional().or(z.literal('')),
  customerNotes: z.string().trim().max(siteConfig.commerce.maxNotesLength).optional().or(z.literal('')),
  paymentMethod: z.enum(['NEQUI', 'BREB']).default('NEQUI'),
  items: z.array(orderItemInputSchema).min(1, 'El carrito no puede estar vacío').max(siteConfig.commerce.maxCartItems),
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
