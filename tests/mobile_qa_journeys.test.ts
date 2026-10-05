import { describe, it, expect } from 'vitest';
import { calculateItemPrice, calculateOrderPricing } from '@/catalog/pricing';
import { createOrderInputSchema } from '@/lib/validations/order';
import {
  createOrder,
  getOrderByPublicCode,
  updateOrderPaymentStatus,
  createPaymentTransaction,
  getTransactionByExternalId,
} from '@/lib/db/repository';
import { XPAGProvider } from '@/lib/payments/xpag';

describe('Auditoría de Jornadas Móviles Obligatorias (Mobile QA)', () => {
  // -------------------------------------------------------------
  // JORNADA 1: Home -> Combo -> 2 pizzas -> sabores -> carrinho
  // -------------------------------------------------------------
  it('Jornada 1: Home -> Combo -> 2 pizzas -> sabores -> carrinho', () => {
    const comboId = 'super-combo-4'; // 2 Familiares (8 porc. c/u) + 1 Gaseosa 1.5 L = $55.900 COP

    // Pizza 1: Hawaiana
    const pizza1 = {
      sizeId: 'familiar' as const,
      isHalfAndHalf: false,
      primaryFlavorId: 'hawaiana',
      crustId: 'traditional' as const,
      extraIngredientIds: [],
    };

    // Pizza 2: Pollo con Champiñones
    const pizza2 = {
      sizeId: 'familiar' as const,
      isHalfAndHalf: false,
      primaryFlavorId: 'pollo-champinones',
      crustId: 'traditional' as const,
      extraIngredientIds: [],
    };

    const selectedDrinks = ['colombiana-postobon-1-5l'];

    // Cálculo item price
    const itemPricing = calculateItemPrice(comboId, 1, {
      pizzas: [pizza1, pizza2],
      selectedDrinkIds: selectedDrinks,
    });

    expect(itemPricing.unitPriceCOP).toBe(55900);
    expect(itemPricing.totalPriceCOP).toBe(55900);

    // Agregar al carrito
    const cartItems = [
      {
        productId: comboId,
        quantity: 1,
        customization: {
          pizzas: [pizza1, pizza2],
          selectedDrinkIds: selectedDrinks,
        },
      },
    ];

    const cartPricing = calculateOrderPricing(cartItems);
    expect(cartPricing.totalItemCount).toBe(1);
    expect(cartPricing.subtotalCOP).toBe(55900);
    expect(cartPricing.isMinOrderMet).toBe(true);
  });

  // -------------------------------------------------------------
  // JORNADA 2: Pizza mitad y mitad -> borde -> adicionais -> adicionar
  // -------------------------------------------------------------
  it('Jornada 2: Pizza mitad y mitad -> borde -> adicionais -> adicionar', () => {
    const productId = 'pizza-familiar'; // Base: $36.900 COP

    // Mitad y Mitad: Criolla (carne molida, plátano maduro) + Pepperoni
    // Borde relleno de queso (+8.900 COP para Familiar)
    // Adicionales: Tocineta (+5.900) + Champiñones (+5.900)
    const pizzaCustomization = {
      pizzas: [
        {
          sizeId: 'familiar' as const,
          isHalfAndHalf: true,
          primaryFlavorId: 'criolla',
          secondaryFlavorId: 'pepperoni',
          crustId: 'cheese' as const, // +8.900
          extraIngredientIds: ['tocineta', 'champinones'], // +5.900 * 2 = +11.800
          notes: 'Masa delgada por favor',
        },
      ],
    };

    const itemPricing = calculateItemPrice(productId, 1, pizzaCustomization);
    const expectedTotal = 36900 + 7900 + 5900 + 5900; // 56.600 COP

    expect(itemPricing.unitPriceCOP).toBe(expectedTotal);
    expect(itemPricing.totalPriceCOP).toBe(expectedTotal);
    expect(itemPricing.pizzaBreakdowns[0].crustPriceCOP).toBe(7900);
    expect(itemPricing.pizzaBreakdowns[0].extrasPriceCOP).toBe(11800);
  });

  // -------------------------------------------------------------
  // JORNADA 3: Carrinho -> sobremesa -> checkout
  // -------------------------------------------------------------
  it('Jornada 3: Carrinho -> sobremesa -> checkout', () => {
    // Carrito con combo inicial
    const cartItems = [
      {
        productId: 'combo-especial-pepperoni', // $31.900 COP
        quantity: 1,
        customization: {
          pizzas: [
            {
              sizeId: 'mediana' as const,
              isHalfAndHalf: false,
              primaryFlavorId: 'pepperoni',
              crustId: 'traditional' as const,
              extraIngredientIds: [],
            },
          ],
          selectedDrinkIds: ['coca-cola-original-1-5l'],
        },
      },
    ];

    // Upsell / Sobremesa agregada desde el carrito con 1-toque: Brownie de Chocolate ($6.900 COP)
    cartItems.push({
      productId: 'brownie-chocolate',
      quantity: 1,
      customization: undefined as any,
    });

    const cartPricing = calculateOrderPricing(cartItems);
    expect(cartPricing.totalItemCount).toBe(2);
    expect(cartPricing.subtotalCOP).toBe(31900 + 6900); // 38.800 COP
    expect(cartPricing.totalCOP).toBe(38800);
    expect(cartPricing.deliveryFeeCOP).toBe(0); // Domicilio gratis
    expect(cartPricing.isMinOrderMet).toBe(true);
  });

  // -------------------------------------------------------------
  // JORNADA 4: Checkout -> endereço -> Nequi/Bre-B -> pagamento pending
  // -------------------------------------------------------------
  it('Jornada 4: Checkout -> endereço -> Nequi/Bre-B -> pagamento pending', async () => {
    const checkoutData = {
      customerName: 'Santiago Rodríguez Restrepo',
      phone: '3001234567', // 10 dígitos colombianos válidos
      department: 'Cundinamarca',
      city: 'Bogotá D.C.',
      barrio: 'Chapinero Alto',
      address: 'Calle 57 # 4 - 28',
      complement: 'Apto 601',
      deliveryReference: 'Edificio Los Rosales',
      customerNotes: 'Timbrar al apto 601',
      paymentMethod: 'NEQUI' as const,
      items: [
        {
          productId: 'super-combo-1', // $27.900 COP
          quantity: 1,
          customization: {
            pizzas: [
              {
                sizeId: 'personal' as const,
                isHalfAndHalf: false,
                primaryFlavorId: 'hawaiana',
                crustId: 'traditional' as const,
                extraIngredientIds: [],
              },
            ],
            selectedDrinkIds: ['coca-cola-original-1-5l'],
          },
        },
      ],
    };

    // Validación de esquema
    const validationResult = createOrderInputSchema.safeParse(checkoutData);
    expect(validationResult.success).toBe(true);

    const pricing = calculateOrderPricing(checkoutData.items);
    const publicCode = 'PED-JORNADA4';
    const externalId = `${publicCode}-1`;

    // Persistencia en base de datos
    const createdOrder = await createOrder({
      publicCode,
      customerName: checkoutData.customerName,
      phone: checkoutData.phone,
      department: checkoutData.department,
      city: checkoutData.city,
      barrio: checkoutData.barrio,
      address: checkoutData.address,
      complement: checkoutData.complement,
      deliveryReference: checkoutData.deliveryReference,
      customerNotes: checkoutData.customerNotes,
      subtotal: pricing.subtotalCOP,
      deliveryFee: pricing.deliveryFeeCOP,
      total: pricing.totalCOP,
      currency: 'COP',
      items: pricing.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        unitPrice: it.unitPriceCOP,
        totalPrice: it.totalPriceCOP,
        customizations: it.customization,
      })),
    });

    expect(createdOrder.orderStatus).toBe('awaiting_payment');
    expect(createdOrder.paymentStatus).toBe('pending');

    // Inicializar pasarela XPAG
    const xpag = new XPAGProvider();
    const payment = await xpag.createPayment({
      orderId: createdOrder.id,
      orderPublicCode: createdOrder.publicCode,
      externalId,
      amountCOP: createdOrder.total,
      customerPhone: createdOrder.phone,
      customerName: createdOrder.customerName,
      paymentMethod: 'NEQUI',
      webhookUrl: 'http://localhost:3000/api/webhooks/xpag',
    });

    expect(payment.ok).toBe(true);
    expect(payment.currency).toBe('COP');
    expect(payment.amountCOP).toBe(27900);

    // Registro de la transacción
    await createPaymentTransaction({
      orderId: createdOrder.id,
      provider: 'xpag',
      externalId,
      providerTransactionId: payment.transactionId,
      amount: payment.amountCOP,
      currency: 'COP',
      method: 'NEQUI',
      status: 'pending',
      payeeData: payment.payeeData,
    });

    const tx = await getTransactionByExternalId(externalId);
    expect(tx).toBeDefined();
    expect(tx?.status).toBe('pending');
  });

  // -------------------------------------------------------------
  // JORNADA 5: Pending -> paid -> pedido confirmado
  // -------------------------------------------------------------
  it('Jornada 5: Pending -> paid -> pedido confirmado', async () => {
    const publicCode = 'PED-JORNADA5';

    const order = await createOrder({
      publicCode,
      customerName: 'Valeria Mejía',
      phone: '3157778899',
      department: 'Valle del Cauca',
      city: 'Cali',
      barrio: 'Granada',
      address: 'Avenida 9N # 12 - 34',
      subtotal: 42900,
      deliveryFee: 0,
      total: 42900,
      currency: 'COP',
      items: [
        {
          productId: 'super-combo-2',
          productName: 'Super Combo 2',
          quantity: 1,
          unitPrice: 42900,
          totalPrice: 42900,
        },
      ],
    });

    expect(order.paymentStatus).toBe('pending');
    expect(order.orderStatus).toBe('awaiting_payment');

    // Simular webhook de confirmación XPAG exitoso
    await updateOrderPaymentStatus(order.id, 'paid', 'confirmed');

    // Verificar consulta pública
    const fetched = await getOrderByPublicCode(publicCode);
    expect(fetched).toBeDefined();
    expect(fetched?.paymentStatus).toBe('paid');
    expect(fetched?.orderStatus).toBe('confirmed');
  });

  // -------------------------------------------------------------
  // JORNADA 6: Refresh no meio do pagamento -> recuperação correta
  // -------------------------------------------------------------
  it('Jornada 6: Refresh no meio do pagamento -> recuperação correta', async () => {
    const publicCode = 'PED-JORNADA6';
    const externalId = `${publicCode}-1`;

    const created = await createOrder({
      publicCode,
      customerName: 'Felipe Correa',
      phone: '3109876543',
      department: 'Santander',
      city: 'Bucaramanga',
      barrio: 'Cabecera',
      address: 'Carrera 35 # 48 - 12',
      subtotal: 31900,
      deliveryFee: 0,
      total: 31900,
      currency: 'COP',
      items: [
        {
          productId: 'combo-especial-pepperoni',
          productName: 'Combo Especial Pepperoni',
          quantity: 1,
          unitPrice: 31900,
          totalPrice: 31900,
        },
      ],
    });

    await createPaymentTransaction({
      orderId: created.id,
      provider: 'xpag',
      externalId,
      providerTransactionId: 'TX-REFRESH-6',
      amount: 31900,
      currency: 'COP',
      method: 'BREB',
      status: 'pending',
      payeeData: {
        name: 'PIZZERIA EXPRESS S.A.S.',
        key: '3109876543',
        bankName: 'Bre-B Bancolombia',
      },
    });

    // 1er request (antes del refresh)
    const initialLoad = await getOrderByPublicCode(publicCode);
    expect(initialLoad).toBeDefined();
    expect(initialLoad?.publicCode).toBe(publicCode);
    expect(initialLoad?.paymentStatus).toBe('pending');
    expect(initialLoad?.total).toBe(31900);

    // Simula refresh de página (segundo request al endpoint /api/orders/[publicCode])
    const afterRefresh = await getOrderByPublicCode(publicCode);
    expect(afterRefresh).toBeDefined();
    expect(afterRefresh?.id).toBe(initialLoad?.id);
    expect(afterRefresh?.paymentStatus).toBe('pending');
    expect(afterRefresh?.total).toBe(initialLoad?.total);

    // Si durante el polling o refresh se confirma el pago:
    await updateOrderPaymentStatus(afterRefresh!.id, 'paid', 'confirmed');

    const refreshedConfirmed = await getOrderByPublicCode(publicCode);
    expect(refreshedConfirmed?.paymentStatus).toBe('paid');
    expect(refreshedConfirmed?.orderStatus).toBe('confirmed');
  });
});
