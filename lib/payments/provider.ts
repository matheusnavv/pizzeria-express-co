/**
 * Normalized Payment Gateway Interface
 * Decouples the application from any specific payment processor.
 */

export type NormalizedPaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'cancelled'
  | 'refunded';

export type ColombianPaymentMethod = 'NEQUI' | 'BREB';

export interface CreatePaymentInput {
  orderId: string;
  orderPublicCode: string;
  externalId: string; // Unique per attempt (e.g. PED-48291-1)
  amountCOP: number;
  customerPhone: string; // Colombian mobile (e.g. 3001234567)
  customerName: string;
  paymentMethod: ColombianPaymentMethod;
  webhookUrl: string;
  returnUrl?: string;
}

export interface NormalizedPaymentResponse {
  ok: boolean;
  provider: string;
  transactionId: string;
  requestNumber?: string;
  externalId: string;
  status: NormalizedPaymentStatus;
  amountCOP: number;
  currency: 'COP';
  paymentMethod: ColombianPaymentMethod;
  checkoutUrl?: string | null;
  qrCode?: string | null;
  qrCodeImage?: string | null;
  payeeData?: {
    name?: string;
    accountNumber?: string;
    bankName?: string;
    key?: string;
    keyType?: string;
  } | null;
  expiresAt?: Date | null;
  awaitingInstruction?: boolean;
  rawResponse?: unknown;
  errorMessage?: string;
}

export interface PaymentStatusCheckResult {
  transactionId: string;
  externalId?: string;
  status: NormalizedPaymentStatus;
  amountCOP: number;
  currency: string;
  paidAt?: Date | null;
  rawResponse?: unknown;
}

export interface WebhookValidationResult {
  isValid: boolean;
  eventType: string;
  status: NormalizedPaymentStatus;
  transactionId: string;
  externalId?: string;
  amountCOP: number;
  currency: string;
  e2e?: string;
  failReason?: string;
  sanitizedPayload: Record<string, unknown>;
  errorMessage?: string;
}

export interface PaymentProvider {
  name: string;
  createPayment(input: CreatePaymentInput): Promise<NormalizedPaymentResponse>;
  getPaymentStatus(transactionId: string, externalId?: string): Promise<PaymentStatusCheckResult>;
  validateAndParseWebhook(headers: Headers, rawBody: string): Promise<WebhookValidationResult>;
}
