import { NextRequest, NextResponse } from 'next/server';
import { xpagProvider } from '@/lib/payments/xpag';
import {
  getTransactionByExternalId,
  getTransactionByProviderId,
  getOrderById,
  updateOrderPaymentStatus,
  updatePaymentTransaction,
  recordPaymentEvent,
} from '@/lib/db/repository';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers = req.headers;

    // Optional query param token validation
    const secretToken = process.env.XPAG_WEBHOOK_SECRET;
    const url = new URL(req.url);
    const queryToken = url.searchParams.get('token');

    if (secretToken && queryToken && queryToken !== secretToken) {
      console.warn('⛔ Webhook rechazada: token de seguridad inválido.');
      return NextResponse.json({ ok: false, error: 'Token inválido' }, { status: 401 });
    }

    const validation = await xpagProvider.validateAndParseWebhook(headers, rawBody);

    if (!validation.isValid) {
      console.warn('⛔ Webhook inválido de XPAG:', validation.errorMessage);
      return NextResponse.json(
        { ok: false, error: validation.errorMessage || 'Payload inválido' },
        { status: 400 }
      );
    }

    // Find the associated transaction by externalId or providerTransactionId
    let transaction = null;
    if (validation.externalId) {
      transaction = await getTransactionByExternalId(validation.externalId);
    }
    if (!transaction && validation.transactionId) {
      transaction = await getTransactionByProviderId(validation.transactionId);
    }

    if (!transaction) {
      console.warn('⚠️ Transacción no encontrada para webhook:', {
        externalId: validation.externalId,
        transactionId: validation.transactionId,
      });
      // Return 200 so provider does not constantly retry unknown events
      return NextResponse.json({
        ok: true,
        warning: 'Transacción no encontrada en el sistema',
      });
    }

    // Idempotency: check if already processed as paid
    if (transaction.status === 'paid' && validation.status === 'paid') {
      console.info(`ℹ️ Idempotencia: Transacción ${transaction.id} ya confirmada anteriormente.`);
      return NextResponse.json({
        ok: true,
        message: 'Evento ya procesado (idempotente)',
      });
    }

    // Retrieve order to validate amount and currency
    const order = await getOrderById(transaction.orderId);
    if (!order) {
      console.error('⛔ Pedido no encontrado para transacción:', transaction.orderId);
      return NextResponse.json({ ok: false, error: 'Pedido inexistente' }, { status: 404 });
    }

    // Validate amount matches
    if (validation.amountCOP > 0 && Math.abs(validation.amountCOP - transaction.amount) > 1) {
      console.error('⛔ Monto pagado no coincide con el pedido:', {
        esperado: transaction.amount,
        recibido: validation.amountCOP,
      });
      return NextResponse.json(
        { ok: false, error: 'El monto pagado no coincide con la transacción' },
        { status: 400 }
      );
    }

    // Record audit event
    await recordPaymentEvent({
      transactionId: transaction.id,
      providerEventId: validation.transactionId,
      eventType: validation.eventType,
      status: validation.status,
      sanitizedPayload: validation.sanitizedPayload,
    });

    // Update transaction
    await updatePaymentTransaction(transaction.id, {
      status: validation.status,
      providerTransactionId: validation.transactionId || transaction.providerTransactionId,
    });

    // If payment confirmed, transition order to paid
    if (validation.status === 'paid') {
      await updateOrderPaymentStatus(order.id, 'paid', 'paid', new Date());
      console.log(`✅ ¡Pago exitoso confirmado para pedido ${order.publicCode}! Monto: $${order.total} COP`);
    } else if (validation.status === 'failed' || validation.status === 'expired') {
      await updateOrderPaymentStatus(order.id, validation.status, 'cancelled');
    }

    return NextResponse.json({ ok: true, processed: true });
  } catch (error: unknown) {
    console.error('Error crítico procesando webhook de XPAG:', error);
    return NextResponse.json(
      { ok: false, error: 'Error procesando webhook' },
      { status: 500 }
    );
  }
}
