import { NextRequest, NextResponse } from 'next/server';
import {
  getOrderByPublicCode,
  updateOrderPaymentStatus,
  updatePaymentTransaction,
} from '@/lib/db/repository';
import { xpagProvider } from '@/lib/payments/xpag';

export async function GET(
  req: NextRequest,
  { params }: { params: { publicCode: string } }
) {
  try {
    const { publicCode } = params;
    const order = await getOrderByPublicCode(publicCode);

    if (!order) {
      return NextResponse.json(
        { ok: false, error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // If order is still pending, check live with payment provider for reconciliation
    const latestTx = order.transactions?.[order.transactions.length - 1];
    if (order.paymentStatus === 'pending' && latestTx) {
      try {
        const liveCheck = await xpagProvider.getPaymentStatus(
          latestTx.providerTransactionId || latestTx.id,
          latestTx.externalId
        );

        if (liveCheck.status === 'paid') {
          await updateOrderPaymentStatus(order.id, 'paid', 'paid', new Date());
          await updatePaymentTransaction(latestTx.id, { status: 'paid' });
          order.paymentStatus = 'paid';
          order.orderStatus = 'paid';
          order.paidAt = new Date();
        } else if (liveCheck.status === 'failed' || liveCheck.status === 'expired') {
          await updateOrderPaymentStatus(order.id, liveCheck.status, 'cancelled');
          await updatePaymentTransaction(latestTx.id, { status: liveCheck.status });
          order.paymentStatus = liveCheck.status;
        }
      } catch (checkErr) {
        console.warn('Reconciliation check error (non-fatal):', checkErr);
      }
    }

    return NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        publicCode: order.publicCode,
        customerName: order.customerName,
        phone: order.phone,
        department: order.department,
        city: order.city,
        barrio: order.barrio,
        address: order.address,
        complement: order.complement,
        deliveryReference: order.deliveryReference,
        customerNotes: order.customerNotes,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        items: order.items,
        payment: latestTx
          ? {
              externalId: latestTx.externalId,
              providerTransactionId: latestTx.providerTransactionId,
              method: latestTx.method,
              status: latestTx.status,
              checkoutUrl: latestTx.checkoutUrl,
              payeeData: latestTx.payeeData,
              expiresAt: latestTx.expiresAt,
            }
          : null,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { ok: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
