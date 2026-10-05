import {
  CreatePaymentInput,
  NormalizedPaymentResponse,
  NormalizedPaymentStatus,
  PaymentProvider,
  PaymentStatusCheckResult,
  WebhookValidationResult,
} from './provider';

export class XPAGProvider implements PaymentProvider {
  name = 'XPAG';

  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private webhookSecret: string;

  constructor() {
    this.clientId = process.env.XPAG_CLIENT_ID || '';
    this.clientSecret = process.env.XPAG_CLIENT_SECRET || '';
    this.baseUrl = (process.env.XPAG_BASE_URL || 'https://api.xpag.global').replace(/\/+$/, '');
    this.webhookSecret = process.env.XPAG_WEBHOOK_SECRET || '';
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Client-Id': this.clientId,
      'X-Client-Secret': this.clientSecret,
    };
  }

  private normalizePhone(phone: string): string {
    // Keep only numbers
    const cleaned = phone.replace(/\D/g, '');
    // If it has Colombian international prefix 57, strip it to get the 10-digit mobile
    if (cleaned.startsWith('57') && cleaned.length === 12) {
      return cleaned.slice(2);
    }
    return cleaned;
  }

  private mapXPAGStatus(status: string): NormalizedPaymentStatus {
    const lower = (status || '').toLowerCase();
    switch (lower) {
      case 'confirmed':
      case 'completed':
      case 'paid':
        return 'paid';
      case 'failed':
      case 'error':
        return 'failed';
      case 'expired':
        return 'expired';
      case 'cancelled':
        return 'cancelled';
      case 'refunded':
      case 'med':
        return 'refunded';
      case 'pending':
      default:
        return 'pending';
    }
  }

  async createPayment(input: CreatePaymentInput): Promise<NormalizedPaymentResponse> {
    const normalizedPhone = this.normalizePhone(input.customerPhone);

    // Validate Colombian mobile number (10 digits starting with 3)
    if (!/^3\d{9}$/.test(normalizedPhone)) {
      throw new Error('El número celular colombiano debe tener 10 dígitos y comenzar con 3 (ej. 3001234567).');
    }

    if (input.amountCOP < 10000) {
      throw new Error('El monto mínimo para procesar un pago en COP es de $10.000 COP.');
    }

    const payload = {
      currency: 'COP',
      method: input.paymentMethod, // 'NEQUI' or 'BREB'
      amount: input.amountCOP,
      phone: normalizedPhone,
      external_id: input.externalId,
      webhook_url: input.webhookUrl,
      generateCheckout: true,
    };

    // If in development and using sandbox credentials or no credentials set, handle gracefully
    const isSandbox =
      process.env.NODE_ENV !== 'production' &&
      (!this.clientId || this.clientId.startsWith('xpagsandbox_'));

    try {
      if (this.clientId && this.clientSecret) {
        const response = await fetch(`${this.baseUrl}/cashin`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.ok) {
          return {
            ok: true,
            provider: this.name,
            transactionId: data.transaction_id || data.request_number || input.externalId,
            requestNumber: data.request_number,
            externalId: input.externalId,
            status: this.mapXPAGStatus(data.status || 'pending'),
            amountCOP: Math.round(Number(data.amount) || input.amountCOP),
            currency: 'COP',
            paymentMethod: input.paymentMethod,
            checkoutUrl: data.checkout_url || null,
            payeeData: data.payee_data || null,
            awaitingInstruction: Boolean(data.awaiting_instruction),
            rawResponse: data,
          };
        } else if (!isSandbox) {
          // In production, throw the real API error
          throw new Error(data.message || data.error_code || 'Error en la respuesta del proveedor de pagos XPAG.');
        }
      }
    } catch (err: unknown) {
      if (!isSandbox) {
        throw err;
      }
      console.warn('⚠️ Llamada a API XPAG falló en desarrollo/sandbox. Generando respuesta simulada de pruebas.');
    }

    // Dev/Sandbox simulation fallback (never allowed in production)
    if (isSandbox) {
      const mockTxId = `cop_sandbox_${Date.now()}`;
      return {
        ok: true,
        provider: this.name,
        transactionId: mockTxId,
        requestNumber: `req_${Date.now()}`,
        externalId: input.externalId,
        status: 'pending',
        amountCOP: input.amountCOP,
        currency: 'COP',
        paymentMethod: input.paymentMethod,
        checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/mock/sandbox-checkout?tx=${mockTxId}&amount=${input.amountCOP}&method=${input.paymentMethod}`,
        payeeData: {
          name: 'XPAG COLOMBIA SANDBOX',
          accountNumber: '0110599520000001234567',
          bankName: input.paymentMethod === 'NEQUI' ? 'NEQUI' : 'BRE-B (BANCARIA)',
          key: normalizedPhone,
          keyType: 'PHONE',
        },
        awaitingInstruction: false,
        rawResponse: { sandbox: true },
      };
    }

    throw new Error('No se pudo establecer conexión con el proveedor de pagos XPAG.');
  }

  async getPaymentStatus(transactionId: string, externalId?: string): Promise<PaymentStatusCheckResult> {
    const isSandbox =
      process.env.NODE_ENV !== 'production' &&
      (!this.clientId || this.clientId.startsWith('xpagsandbox_'));

    if (this.clientId && this.clientSecret) {
      try {
        const queryParam = transactionId.startsWith('cop_')
          ? `transaction_id=${encodeURIComponent(transactionId)}`
          : externalId
          ? `external_id=${encodeURIComponent(externalId)}`
          : `transaction_id=${encodeURIComponent(transactionId)}`;

        const response = await fetch(`${this.baseUrl}/consult-transaction?${queryParam}`, {
          method: 'GET',
          headers: this.getAuthHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            transactionId: data.transaction_id || transactionId,
            externalId: data.external_id || externalId,
            status: this.mapXPAGStatus(data.status),
            amountCOP: Math.round(Number(data.amount) || 0),
            currency: data.currency || 'COP',
            rawResponse: data,
          };
        }
      } catch (err) {
        if (!isSandbox) throw err;
      }
    }

    // Fallback for sandbox
    return {
      transactionId,
      externalId,
      status: 'pending',
      amountCOP: 0,
      currency: 'COP',
    };
  }

  async validateAndParseWebhook(headers: Headers, rawBody: string): Promise<WebhookValidationResult> {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return {
        isValid: false,
        eventType: 'unknown',
        status: 'failed',
        transactionId: '',
        amountCOP: 0,
        currency: 'COP',
        sanitizedPayload: {},
        errorMessage: 'Payload no es un JSON válido',
      };
    }

    // Optional token validation if webhookSecret is configured
    if (this.webhookSecret) {
      const headerSecret = headers.get('x-webhook-secret') || headers.get('authorization');
      // If XPAG webhook sends token via header or query params
      if (headerSecret && headerSecret !== this.webhookSecret && !headerSecret.includes(this.webhookSecret)) {
        return {
          isValid: false,
          eventType: String(payload.type || 'unknown'),
          status: 'failed',
          transactionId: String(payload.transaction_id || ''),
          amountCOP: 0,
          currency: 'COP',
          sanitizedPayload: payload,
          errorMessage: 'Firma o secreto de webhook no coincide',
        };
      }
    }

    const type = String(payload.type || 'cashin');
    const rawStatus = String(payload.status || 'pending');
    const normalizedStatus = this.mapXPAGStatus(rawStatus);
    const transactionId = String(payload.transaction_id || payload.request_number || '');
    const externalId = payload.external_id ? String(payload.external_id) : undefined;
    const amount = Math.round(Number(payload.amount) || 0);
    const currency = String(payload.currency || 'COP').toUpperCase();

    // Verify it's in COP
    if (currency !== 'COP') {
      return {
        isValid: false,
        eventType: type,
        status: 'failed',
        transactionId,
        externalId,
        amountCOP: amount,
        currency,
        sanitizedPayload: payload,
        errorMessage: `Moneda inválida en webhook: se esperaba COP, se recibió ${currency}`,
      };
    }

    return {
      isValid: true,
      eventType: type,
      status: normalizedStatus,
      transactionId,
      externalId,
      amountCOP: amount,
      currency: 'COP',
      e2e: payload.e2e ? String(payload.e2e) : undefined,
      failReason: payload.fail_reason ? String(payload.fail_reason) : undefined,
      sanitizedPayload: payload,
    };
  }
}

export const xpagProvider = new XPAGProvider();
