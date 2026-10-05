import { describe, it, expect } from 'vitest';
import { calculateItemPrice, calculateOrderPricing } from '@/catalog/pricing';
import { createOrderInputSchema } from '@/lib/validations/order';
import { createOrder, getOrderByPublicCode, updateOrderPaymentStatus, createPaymentTransaction, getTransactionByExternalId } from '@/lib/db/repository';
import { XPAGProvider } from '@/lib/payments/xpag';

describe('Flujo Completo E2E (Mobile Flow)', () => {
  it('ejecuta exitosamente el flujo completo desde el catálogo hasta el pedido confirmado', async () => {
    // 1. Home -> Super Combo 5 (2 Extragrandes + 2 Gaseosas 1.5 L = $62.900 COP)
    const comboId = 'super-combo-5';

    // 2. Configuración de Pizza 1: Mitad y Mitad (Hawaiana / Pollo Champiñones) + Borde Queso y Bocadillo (+12.900) + Extra Tocineta (+7.900)
    const pizza1Config = {
      sizeId: 'extragrande' as const,
      isHalfAndHalf: true,
      primaryFlavorId: 'hawaiana',
      secondaryFlavorId: 'pollo-champinones',
      crustId: 'cheese_bocadillo' as const,
      extraIngredientIds: ['tocineta'],
      notes: 'Bien crujiente por favor',
    };

    // 3. Configuración de Pizza 2: Un solo sabor (Pepperoni) + Borde tradicional ($0) + sin extras
    const pizza2Config = {
      sizeId: 'extragrande' as const,
      isHalfAndHalf: false,
      primaryFlavorId: 'pepperoni',
      crustId: 'traditional' as const,
      extraIngredientIds: [],
    };

    // 4. Selección de Gaseosas: 1 Coca-Cola Original + 1 Colombiana Postobón
    const selectedDrinks = ['coca-cola-original-1-5l', 'colombiana-postobon-1-5l'];

    // 5. Cálculo del precio de la personalización
    const comboPricing = calculateItemPrice(comboId, 1, {
      pizzas: [pizza1Config, pizza2Config],
      selectedDrinkIds: selectedDrinks,
    });

    // Base: 62.900 + Borde Pizza 1 (12.900) + Extra Pizza 1 (7.900) = 83.700 COP
    expect(comboPricing.unitPriceCOP).toBe(62900 + 12900 + 7900);
    expect(comboPricing.totalPriceCOP).toBe(83700);

    // 6. Cross-sell: Agregar Pan de Ajo con Queso (6.900 COP)
    const crossSellId = 'pan-de-ajo-queso';
    const sidePricing = calculateItemPrice(crossSellId, 1);
    expect(sidePricing.totalPriceCOP).toBe(6900);

    // 7. Carrinho: Recálculo general
    const cartItems = [
      {
        productId: comboId,
        quantity: 1,
        customization: {
          pizzas: [pizza1Config, pizza2Config],
          selectedDrinkIds: selectedDrinks,
        },
      },
      {
        productId: crossSellId,
        quantity: 1,
      },
    ];

    const orderPricing = calculateOrderPricing(cartItems);
    // 83.700 + 6.900 = 90.600 COP
    expect(orderPricing.subtotalCOP).toBe(90600);
    expect(orderPricing.deliveryFeeCOP).toBe(0); // Domicilio gratis
    expect(orderPricing.totalCOP).toBe(90600);
    expect(orderPricing.isMinOrderMet).toBe(true);

    // 8. Checkout: Validación de datos de entrega colombianos
    const checkoutFormData = {
      customerName: 'Mariana Duque Gómez',
      phone: '3128904567',
      department: 'Antioquia',
      city: 'Envigado',
      barrio: 'La Magnolia',
      address: 'Transversal 32A Sur # 33 - 45',
      complement: 'Casa 102',
      deliveryReference: 'Diagonal al supermercado Euro',
      customerNotes: 'Timbre número 2',
      paymentMethod: 'NEQUI' as const,
      items: cartItems,
    };

    const parsedOrder = createOrderInputSchema.safeParse(checkoutFormData);
    expect(parsedOrder.success).toBe(true);

    // 9. Creación del pedido en Base de Datos (status: awaiting_payment, paymentStatus: pending)
    const publicCode = 'PED-77889';
    const externalId = `${publicCode}-1`;

    const storedOrder = await createOrder({
      publicCode,
      customerName: checkoutFormData.customerName,
      phone: '3128904567',
      department: checkoutFormData.department,
      city: checkoutFormData.city,
      barrio: checkoutFormData.barrio,
      address: checkoutFormData.address,
      complement: checkoutFormData.complement,
      deliveryReference: checkoutFormData.deliveryReference,
      customerNotes: checkoutFormData.customerNotes,
      subtotal: orderPricing.subtotalCOP,
      deliveryFee: orderPricing.deliveryFeeCOP,
      total: orderPricing.totalCOP,
      currency: 'COP',
      items: orderPricing.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        unitPrice: it.unitPriceCOP,
        totalPrice: it.totalPriceCOP,
        customizations: it.customization,
      })),
    });

    expect(storedOrder.publicCode).toBe(publicCode);
    expect(storedOrder.paymentStatus).toBe('pending');
    expect(storedOrder.orderStatus).toBe('awaiting_payment');
    expect(storedOrder.total).toBe(90600);

    // 10. Pasarela de Pago: Iniciar transacción XPAG
    const xpag = new XPAGProvider();
    const payment = await xpag.createPayment({
      orderId: storedOrder.id,
      orderPublicCode: storedOrder.publicCode,
      externalId,
      amountCOP: storedOrder.total,
      customerPhone: storedOrder.phone,
      customerName: storedOrder.customerName,
      paymentMethod: 'NEQUI',
      webhookUrl: 'http://localhost:3000/api/webhooks/xpag',
    });

    expect(payment.ok).toBe(true);
    expect(payment.currency).toBe('COP');
    expect(payment.amountCOP).toBe(90600);
    expect(payment.externalId).toBe(externalId);

    await createPaymentTransaction({
      orderId: storedOrder.id,
      provider: payment.provider,
      externalId,
      providerTransactionId: payment.transactionId,
      amount: payment.amountCOP,
      currency: 'COP',
      method: 'NEQUI',
      status: 'pending',
      checkoutUrl: payment.checkoutUrl || undefined,
    });

    // 11. Simulación de Webhook de confirmación bancaria
    const webhookPayload = JSON.stringify({
      type: 'cashin',
      status: 'confirmed',
      amount: 90600.0,
      currency: 'COP',
      external_id: externalId,
      transaction_id: payment.transactionId,
      e2e: 'E2026100599999',
      provider: 'XPAG',
    });

    const parsedWebhook = await xpag.validateAndParseWebhook(new Headers(), webhookPayload);
    expect(parsedWebhook.isValid).toBe(true);
    expect(parsedWebhook.status).toBe('paid');

    // Transición a Pagado (Confirmado)
    await updateOrderPaymentStatus(storedOrder.id, 'paid', 'paid', new Date());

    // 12. Verificación final: Pedido Confirmado
    const confirmedOrder = await getOrderByPublicCode(publicCode);
    expect(confirmedOrder).not.toBeNull();
    expect(confirmedOrder?.paymentStatus).toBe('paid');
    expect(confirmedOrder?.orderStatus).toBe('paid');
    expect(confirmedOrder?.paidAt).toBeDefined();
  });
});
