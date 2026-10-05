import { NextRequest, NextResponse } from 'next/server';
import { createOrderInputSchema } from '@/lib/validations/order';
import { calculateOrderPricing } from '@/catalog/pricing';
import { createOrder, createPaymentTransaction } from '@/lib/db/repository';
import { xpagProvider } from '@/lib/payments/xpag';
import { siteConfig } from '@/config/siteConfig';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parseResult = createOrderInputSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Datos de pedido inválidos',
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const input = parseResult.data;

    // Strict server-side pricing recalculation
    const pricing = calculateOrderPricing(input.items, input.deliveryOptionId);

    if (!pricing.isMinOrderMet) {
      return NextResponse.json(
        {
          ok: false,
          error: `El pedido mínimo es de $${siteConfig.commerce.minOrderCOP.toLocaleString('es-CO')} COP. Tu subtotal actual es de $${pricing.subtotalCOP.toLocaleString('es-CO')} COP.`,
          subtotalCOP: pricing.subtotalCOP,
          minOrderRequiredCOP: siteConfig.commerce.minOrderCOP,
        },
        { status: 400 }
      );
    }

    // Generate unique order public code (e.g. PED-48291)
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const publicCode = `PED-${randomDigits}`;

    // Generate unique external ID for this specific payment attempt
    const externalId = `${publicCode}-${Date.now().toString().slice(-4)}`;

    // Persist order in database
    const order = await createOrder({
      publicCode,
      customerName: input.customerName,
      phone: input.phone,
      department: input.department,
      city: input.city,
      barrio: input.barrio,
      address: input.address,
      complement: input.complement,
      deliveryReference: input.deliveryReference,
      customerNotes: input.customerNotes,
      subtotal: pricing.subtotalCOP,
      deliveryFee: pricing.deliveryFeeCOP,
      total: pricing.totalCOP,
      currency: 'COP',
      items: pricing.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPriceCOP,
        totalPrice: item.totalPriceCOP,
        customizations: item.customization,
      })),
    });

    // Base URL for webhooks and return URLs
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const webhookSecret = process.env.XPAG_WEBHOOK_SECRET;
    const webhookUrl = webhookSecret
      ? `${appUrl}/api/webhooks/xpag?token=${encodeURIComponent(webhookSecret)}`
      : `${appUrl}/api/webhooks/xpag`;

    // Initiate payment with XPAG
    const paymentResponse = await xpagProvider.createPayment({
      orderId: order.id,
      orderPublicCode: order.publicCode,
      externalId,
      amountCOP: pricing.totalCOP,
      customerPhone: input.phone,
      customerName: input.customerName,
      paymentMethod: input.paymentMethod,
      webhookUrl,
      returnUrl: `${appUrl}/pedido/${order.publicCode}`,
    });

    // Save transaction in database
    const tx = await createPaymentTransaction({
      orderId: order.id,
      provider: paymentResponse.provider,
      externalId,
      providerTransactionId: paymentResponse.transactionId,
      requestNumber: paymentResponse.requestNumber,
      amount: paymentResponse.amountCOP,
      currency: 'COP',
      method: input.paymentMethod,
      status: paymentResponse.status,
      checkoutUrl: paymentResponse.checkoutUrl || undefined,
      payeeData: paymentResponse.payeeData,
      expiresAt: paymentResponse.expiresAt || undefined,
    });

    return NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        publicCode: order.publicCode,
        customerName: order.customerName,
        subtotalCOP: pricing.subtotalCOP,
        deliveryFeeCOP: pricing.deliveryFeeCOP,
        totalCOP: pricing.totalCOP,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      },
      payment: {
        transactionId: tx.id,
        externalId: tx.externalId,
        providerTransactionId: tx.providerTransactionId,
        method: tx.method,
        status: tx.status,
        checkoutUrl: tx.checkoutUrl,
        payeeData: tx.payeeData,
        awaitingInstruction: paymentResponse.awaitingInstruction,
      },
    });
  } catch (error: unknown) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Error interno al procesar el pedido.',
      },
      { status: 500 }
    );
  }
}
