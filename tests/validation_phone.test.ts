import { describe, it, expect } from 'vitest';
import { colombianPhoneSchema, createOrderInputSchema } from '@/lib/validations/order';

describe('Validación de Celular Colombiano', () => {
  it('acepta celular de 10 dígitos estándar comenzando con 3', () => {
    const result = colombianPhoneSchema.safeParse('3001234567');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('3001234567');
    }
  });

  it('normaliza números con espacios, guiones o paréntesis', () => {
    const result = colombianPhoneSchema.safeParse('310 987 6543');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('3109876543');
    }

    const result2 = colombianPhoneSchema.safeParse('(320)-123-4567');
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.data).toBe('3201234567');
    }
  });

  it('normaliza prefijo internacional colombiano (+57)', () => {
    const result = colombianPhoneSchema.safeParse('+57 301 234 5678');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('3012345678');
    }
  });

  it('rechaza números que no empiezan por 3 o tienen longitud incorrecta', () => {
    // Teléfono fijo (empieza por 601, etc.)
    expect(colombianPhoneSchema.safeParse('6012345678').success).toBe(false);
    // 9 dígitos
    expect(colombianPhoneSchema.safeParse('300123456').success).toBe(false);
    // 11 dígitos
    expect(colombianPhoneSchema.safeParse('30012345678').success).toBe(false);
    // Letras
    expect(colombianPhoneSchema.safeParse('300ABC4567').success).toBe(false);
  });
});

describe('Validación del Formulario de Pedido Colombiano', () => {
  it('valida un pedido completo con nomenclatura y dirección colombiana', () => {
    const validPayload = {
      customerName: 'Santiago Rodríguez',
      phone: '3157890123',
      department: 'Antioquia',
      city: 'Medellín',
      barrio: 'El Poblado',
      address: 'Calle 10 # 43E - 25',
      complement: 'Apto 502',
      deliveryReference: 'Frente al parque',
      customerNotes: 'Por favor timbre suave',
      paymentMethod: 'NEQUI' as const,
      items: [
        {
          productId: 'super-combo-1',
          quantity: 1,
        },
      ],
    };

    const result = createOrderInputSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rechaza pedidos con campos obligatorios vacíos o carrito vacío', () => {
    const invalidPayload = {
      customerName: '',
      phone: '123',
      department: '',
      city: '',
      barrio: '',
      address: '',
      paymentMethod: 'NEQUI' as const,
      items: [],
    };

    const result = createOrderInputSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
