import { describe, it, expect, vi, beforeEach } from 'vitest';
import { XPAGProvider } from '@/lib/payments/xpag';
import { trackPurchase } from '@/lib/analytics/meta';

describe('XPAG Provider — Integración Colombia COP', () => {
  let provider: XPAGProvider;

  beforeEach(() => {
    provider = new XPAGProvider();
  });

  it('valida que el teléfono del comprador sea celular colombiano de 10 dígitos', async () => {
    await expect(
      provider.createPayment({
        orderId: 'order_test_1',
        orderPublicCode: 'PED-11111',
        externalId: 'PED-11111-1',
        amountCOP: 35900,
        customerPhone: '6012345678', // Fijo de Bogotá
        customerName: 'Cliente Prueba',
        paymentMethod: 'NEQUI',
        webhookUrl: 'https://ejemplo.com/api/webhooks/xpag',
      })
    ).rejects.toThrow('El número celular colombiano debe tener 10 dígitos y comenzar con 3');
  });

  it('valida el monto mínimo de 10.000 COP exigido por la API de XPAG', async () => {
    await expect(
      provider.createPayment({
        orderId: 'order_test_2',
        orderPublicCode: 'PED-22222',
        externalId: 'PED-22222-1',
        amountCOP: 5000, // Menor a 10.000 COP
        customerPhone: '3001234567',
        customerName: 'Cliente Prueba',
        paymentMethod: 'NEQUI',
        webhookUrl: 'https://ejemplo.com/api/webhooks/xpag',
      })
    ).rejects.toThrow('El monto mínimo para procesar un pago en COP es de $10.000 COP');
  });

  it('procesa correctamente un webhook de confirmación (confirmed -> paid)', async () => {
    const rawWebhook = JSON.stringify({
      type: 'cashin',
      status: 'confirmed',
      amount: 42900.0,
      fee: 1200.0,
      currency: 'COP',
      request_number: 'cop_req_123',
      transaction_id: 'cop_tx_456',
      external_id: 'PED-48291-1',
      e2e: 'E2026100512345',
      provider: 'XPAG',
      updated_at: '2026-10-05 12:00:00',
    });

    const headers = new Headers({ 'Content-Type': 'application/json' });
    const result = await provider.validateAndParseWebhook(headers, rawWebhook);

    expect(result.isValid).toBe(true);
    expect(result.status).toBe('paid');
    expect(result.amountCOP).toBe(42900);
    expect(result.currency).toBe('COP');
    expect(result.externalId).toBe('PED-48291-1');
  });

  it('rechaza webhooks con monedas no colombianas (ej. BRL o MXN)', async () => {
    const rawWebhookBrl = JSON.stringify({
      type: 'cashin',
      status: 'confirmed',
      amount: 100.0,
      currency: 'BRL', // Prohibido
      transaction_id: 'tx_brl_1',
    });

    const headers = new Headers({ 'Content-Type': 'application/json' });
    const result = await provider.validateAndParseWebhook(headers, rawWebhookBrl);

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('Moneda inválida en webhook');
  });

  it('mapea correctamente estados failed y expired', async () => {
    const rawFailed = JSON.stringify({
      type: 'cashin',
      status: 'failed',
      amount: 27900,
      currency: 'COP',
      transaction_id: 'tx_fail',
      fail_reason: 'Transacción rechazada por el banco emisor',
    });

    const resultFailed = await provider.validateAndParseWebhook(new Headers(), rawFailed);
    expect(resultFailed.status).toBe('failed');
    expect(resultFailed.failReason).toBe('Transacción rechazada por el banco emisor');

    const rawExpired = JSON.stringify({
      type: 'cashin',
      status: 'expired',
      amount: 27900,
      currency: 'COP',
      transaction_id: 'tx_exp',
    });

    const resultExpired = await provider.validateAndParseWebhook(new Headers(), rawExpired);
    expect(resultExpired.status).toBe('expired');
  });
});

describe('Meta Pixel — Lógica de Eventos y Deduplicación', () => {
  beforeEach(() => {
    // Mock window and fbq
    (global as any).window = {
      fbq: vi.fn(),
    };
    (global as any).localStorage = {
      store: {} as Record<string, string>,
      getItem(key: string) {
        return this.store[key] || null;
      },
      setItem(key: string, val: string) {
        this.store[key] = val;
      },
      removeItem(key: string) {
        delete this.store[key];
      },
    };
    process.env.NEXT_PUBLIC_META_PIXEL_ID = '1234567890';
  });

  it('dispara Purchase una sola vez y evita duplicados en recargas (deduplicación)', () => {
    const firstCall = trackPurchase({
      orderPublicCode: 'PED-99999',
      value: 62900,
      contentIds: ['super-combo-5'],
      numItems: 1,
    });
    expect(firstCall).toBe(true);

    // Segundo llamado con el mismo código de pedido (simulando F5 del usuario)
    const secondCall = trackPurchase({
      orderPublicCode: 'PED-99999',
      value: 62900,
      contentIds: ['super-combo-5'],
      numItems: 1,
    });
    // Debe ser bloqueado por deduplicación
    expect(secondCall).toBe(false);
  });
});
