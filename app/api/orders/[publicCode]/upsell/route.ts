import { NextRequest, NextResponse } from 'next/server';
import { getOrderByPublicCode, createPaymentTransaction, getOrderByPublicCode as fetchOrder } from '@/lib/db/repository';
import { ALL_UPSELL_CONFIGS } from '@/config/upsellConfig';
import { xpagProvider } from '@/lib/payments/xpag';

export async function POST(
  req: NextRequest,
  { params }: { params: { publicCode: string } }
) {
  try {
    const { publicCode } = params;
    const body = await req.json();
    const { upsellSlug, paymentMethod = 'NEQUI' } = body;

    const order = await getOrderByPublicCode(publicCode);
    if (!order) {
      return NextResponse.json({ ok: false, error: 'Pedido no encontrado' }, { status: 404 });
    }

    const offer = ALL_UPSELL_CONFIGS.find((o) => o.slug === upsellSlug || o.id === upsellSlug);
    if (!offer) {
      return NextResponse.json({ ok: false, error: 'Oferta no válida' }, { status: 400 });
    }

    // Server-side price calculation (never trusts client amount)
    const amountCOP = offer.priceCOP;
    const externalId = `${order.publicCode}_${offer.slug}_${Date.now().toString().slice(-4)}`;

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
      amountCOP,
      customerPhone: order.phone,
      customerName: order.customerName,
      paymentMethod,
      webhookUrl,
      returnUrl: `${appUrl}/pedido/${order.publicCode}`,
    });

    const tx = await createPaymentTransaction({
      orderId: order.id,
      provider: paymentResponse.provider,
      externalId,
      providerTransactionId: paymentResponse.transactionId,
      requestNumber: paymentResponse.requestNumber,
      amount: amountCOP,
      currency: 'COP',
      method: paymentMethod,
      status: paymentResponse.status,
      checkoutUrl: paymentResponse.checkoutUrl || undefined,
      payeeData: paymentResponse.payeeData,
      expiresAt: paymentResponse.expiresAt || undefined,
    });

    return NextResponse.json({
      ok: true,
      transaction: {
        id: tx.id,
        externalId: tx.externalId,
        providerTransactionId: tx.providerTransactionId,
        amount: tx.amount,
        status: tx.status,
        checkoutUrl: tx.checkoutUrl,
        payeeData: tx.payeeData,
        expiresAt: tx.expiresAt,
        lineItemName: offer.lineItemName,
      },
    });
  } catch (error: unknown) {
    console.error('Error generating upsell payment:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error al procesar pago' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { publicCode: string } }
) {
  try {
    const { publicCode } = params;
    const { searchParams } = new URL(req.url);
    const txId = searchParams.get('txId');

    const order = await fetchOrder(publicCode);
    if (!order) {
      return NextResponse.json({ ok: false, error: 'Pedido no encontrado' }, { status: 404 });
    }

    if (txId) {
      const tx = order.transactions.find((t) => t.id === txId || t.externalId === txId || t.providerTransactionId === txId);
      if (!tx) {
        return NextResponse.json({ ok: false, error: 'Transacción no encontrada' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, transaction: tx });
    }

    return NextResponse.json({ ok: true, transactions: order.transactions });
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error al consultar' },
      { status: 500 }
    );
  }
}
