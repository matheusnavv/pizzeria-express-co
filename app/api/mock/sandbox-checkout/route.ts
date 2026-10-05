import { NextRequest, NextResponse } from 'next/server';
import { getTransactionByProviderId, getTransactionByExternalId, getOrderById, updateOrderPaymentStatus, updatePaymentTransaction, recordPaymentEvent } from '@/lib/db/repository';

export async function GET(req: NextRequest) {
  // STRICTLY FORBIDDEN IN PRODUCTION
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Forbidden in production', { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const tx = searchParams.get('tx');
  const amount = searchParams.get('amount');
  const method = searchParams.get('method') || 'NEQUI';

  const html = `<!DOCTYPE html>
<html lang="es-CO">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>XPAG Colombia — Pasarela Sandbox</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: #1e293b; border-radius: 16px; padding: 32px; max-width: 420px; width: 100%; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); text-align: center; }
    .badge { display: inline-block; background: #3b82f6; color: white; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 16px; }
    h1 { font-size: 20px; margin: 0 0 8px 0; color: #f8fafc; }
    p { font-size: 14px; color: #94a3b8; margin: 0 0 24px 0; }
    .amount-box { background: #0f172a; padding: 16px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #334155; }
    .amount-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; }
    .amount-val { font-size: 28px; font-weight: 800; color: #22c55e; margin-top: 4px; }
    .btn { display: block; width: 100%; padding: 14px; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; margin-bottom: 12px; }
    .btn-pay { background: #22c55e; color: #022c22; }
    .btn-pay:hover { background: #16a34a; }
    .btn-fail { background: #ef4444; color: white; }
    .btn-fail:hover { background: #dc2626; }
    .footer { font-size: 11px; color: #64748b; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Simulador XPAG Sandbox</div>
    <h1>Pago con ${method === 'NEQUI' ? 'Nequi' : 'Bre-B'}</h1>
    <p>Entorno de prueba local seguro</p>
    <div class="amount-box">
      <div class="amount-label">Total a pagar</div>
      <div class="amount-val">$${Number(amount || 0).toLocaleString('es-CO')} COP</div>
    </div>
    <form method="POST" action="/api/mock/sandbox-checkout">
      <input type="hidden" name="tx" value="${tx}">
      <input type="hidden" name="action" value="pay">
      <button type="submit" class="btn btn-pay">✓ Simular Pago Exitoso</button>
    </form>
    <form method="POST" action="/api/mock/sandbox-checkout">
      <input type="hidden" name="tx" value="${tx}">
      <input type="hidden" name="action" value="fail">
      <button type="submit" class="btn btn-fail">✕ Simular Pago Rechazado</button>
    </form>
    <div class="footer">Este simulador solo está activo en modo desarrollo y pruebas.</div>
  </div>
</body>
</html>`;

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Forbidden in production', { status: 403 });
  }

  let tx = '';
  let action = 'pay';

  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await req.formData();
    tx = String(formData.get('tx') || '');
    action = String(formData.get('action') || 'pay');
  } else {
    const json = await req.json();
    tx = json.tx;
    action = json.action;
  }

  const transaction =
    (await getTransactionByProviderId(tx)) ||
    (await getTransactionByExternalId(tx));

  if (!transaction) {
    return NextResponse.json({ ok: false, error: 'Transacción no encontrada' }, { status: 404 });
  }

  const order = await getOrderById(transaction.orderId);
  if (!order) {
    return NextResponse.json({ ok: false, error: 'Pedido no encontrado' }, { status: 404 });
  }

  if (action === 'pay') {
    await updatePaymentTransaction(transaction.id, { status: 'paid' });
    await updateOrderPaymentStatus(order.id, 'paid', 'paid', new Date());
    await recordPaymentEvent({
      transactionId: transaction.id,
      eventType: 'sandbox_simulation',
      status: 'paid',
      sanitizedPayload: { simulated: true, action: 'pay' },
    });
  } else {
    await updatePaymentTransaction(transaction.id, { status: 'failed' });
    await updateOrderPaymentStatus(order.id, 'failed', 'cancelled');
  }

  // Redirect back to customer order page
  return NextResponse.redirect(new URL(`/pedido/${order.publicCode}`, req.url));
}
