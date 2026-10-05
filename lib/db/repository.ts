import { prisma } from './prisma';

export interface CreateOrderParams {
  publicCode: string;
  customerName: string;
  phone: string;
  department: string;
  city: string;
  barrio: string;
  address: string;
  complement?: string;
  deliveryReference?: string;
  customerNotes?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    customizations?: unknown;
  }>;
}

export interface StoredOrder {
  id: string;
  publicCode: string;
  customerName: string;
  phone: string;
  department: string;
  city: string;
  barrio: string;
  address: string;
  complement?: string | null;
  deliveryReference?: string | null;
  customerNotes?: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    customizations?: unknown;
    createdAt: Date;
  }>;
  transactions: Array<StoredPaymentTransaction>;
}

export interface StoredPaymentTransaction {
  id: string;
  orderId: string;
  provider: string;
  externalId: string;
  providerTransactionId?: string | null;
  requestNumber?: string | null;
  amount: number;
  currency: string;
  method: string;
  status: string;
  checkoutUrl?: string | null;
  payeeData?: unknown;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Fallback in-memory store for local sandbox dev when local Postgres isn't running
const memoryOrders = new Map<string, StoredOrder>();
const memoryTransactions = new Map<string, StoredPaymentTransaction>();
const memoryEvents: Array<{
  id: string;
  transactionId?: string | null;
  providerEventId?: string | null;
  eventType: string;
  status: string;
  sanitizedPayload: unknown;
  processedAt: Date;
}> = [];

let useMemoryStore = false;

async function executeWithFallback<T>(
  prismaFn: () => Promise<T>,
  memoryFn: () => T | Promise<T>
): Promise<T> {
  if (useMemoryStore) {
    return memoryFn();
  }
  try {
    return await prismaFn();
  } catch (error) {
    // Check if it's a DB connection or initialization failure
    const errStr = String(error);
    const errName = (error as { name?: string })?.name || '';
    if (
      errName === 'PrismaClientInitializationError' ||
      errStr.includes("Can't reach database server") ||
      errStr.includes('Connection refused') ||
      errStr.includes('P1001') ||
      errStr.includes('P1003') ||
      errStr.includes('does not exist') ||
      errStr.includes('Authentication failed')
    ) {
      console.warn('⚠️ PostgreSQL no alcanzable. Usando almacenamiento en memoria local temporal para desarrollo/sandbox.');
      useMemoryStore = true;
      return memoryFn();
    }
    throw error;
  }
}

export async function createOrder(data: CreateOrderParams): Promise<StoredOrder> {
  const id = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date();

  return executeWithFallback(
    async () => {
      const order = await prisma.order.create({
        data: {
          publicCode: data.publicCode,
          customerName: data.customerName,
          phone: data.phone,
          department: data.department,
          city: data.city,
          barrio: data.barrio,
          address: data.address,
          complement: data.complement,
          deliveryReference: data.deliveryReference,
          customerNotes: data.customerNotes,
          subtotal: data.subtotal,
          deliveryFee: data.deliveryFee,
          total: data.total,
          currency: data.currency || 'COP',
          paymentStatus: 'pending',
          orderStatus: 'awaiting_payment',
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              customizations: (item.customizations as object) ?? undefined,
            })),
          },
        },
        include: {
          items: true,
          transactions: true,
        },
      });
      return order as unknown as StoredOrder;
    },
    () => {
      const newOrder: StoredOrder = {
        id,
        publicCode: data.publicCode,
        customerName: data.customerName,
        phone: data.phone,
        department: data.department,
        city: data.city,
        barrio: data.barrio,
        address: data.address,
        complement: data.complement ?? null,
        deliveryReference: data.deliveryReference ?? null,
        customerNotes: data.customerNotes ?? null,
        subtotal: data.subtotal,
        deliveryFee: data.deliveryFee,
        total: data.total,
        currency: data.currency || 'COP',
        paymentStatus: 'pending',
        orderStatus: 'awaiting_payment',
        paidAt: null,
        createdAt: now,
        updatedAt: now,
        items: data.items.map((item, idx) => ({
          id: `item_${Date.now()}_${idx}`,
          orderId: id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          customizations: item.customizations,
          createdAt: now,
        })),
        transactions: [],
      };
      memoryOrders.set(newOrder.id, newOrder);
      return newOrder;
    }
  );
}

export async function getOrderByPublicCode(publicCode: string): Promise<StoredOrder | null> {
  return executeWithFallback(
    async () => {
      const order = await prisma.order.findUnique({
        where: { publicCode },
        include: {
          items: true,
          transactions: true,
        },
      });
      return (order as unknown as StoredOrder) ?? null;
    },
    () => {
      for (const order of memoryOrders.values()) {
        if (order.publicCode === publicCode) {
          return {
            ...order,
            transactions: Array.from(memoryTransactions.values()).filter((t) => t.orderId === order.id),
          };
        }
      }
      return null;
    }
  );
}

export async function getOrderById(id: string): Promise<StoredOrder | null> {
  return executeWithFallback(
    async () => {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
          transactions: true,
        },
      });
      return (order as unknown as StoredOrder) ?? null;
    },
    () => {
      const order = memoryOrders.get(id);
      if (!order) return null;
      return {
        ...order,
        transactions: Array.from(memoryTransactions.values()).filter((t) => t.orderId === order.id),
      };
    }
  );
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: string,
  orderStatus: string,
  paidAt?: Date | null
): Promise<void> {
  const updateData = {
    paymentStatus,
    orderStatus,
    paidAt: paidAt ?? (paymentStatus === 'paid' ? new Date() : undefined),
    updatedAt: new Date(),
  };

  await executeWithFallback(
    async () => {
      await prisma.order.update({
        where: { id: orderId },
        data: updateData,
      });
    },
    () => {
      const order = memoryOrders.get(orderId);
      if (order) {
        order.paymentStatus = paymentStatus;
        order.orderStatus = orderStatus;
        if (paidAt || paymentStatus === 'paid') {
          order.paidAt = paidAt || new Date();
        }
        order.updatedAt = new Date();
      }
    }
  );
}

export async function createPaymentTransaction(data: {
  orderId: string;
  provider: string;
  externalId: string;
  providerTransactionId?: string;
  requestNumber?: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  checkoutUrl?: string;
  payeeData?: unknown;
  expiresAt?: Date;
}): Promise<StoredPaymentTransaction> {
  const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date();

  return executeWithFallback(
    async () => {
      const tx = await prisma.paymentTransaction.create({
        data: {
          orderId: data.orderId,
          provider: data.provider,
          externalId: data.externalId,
          providerTransactionId: data.providerTransactionId,
          requestNumber: data.requestNumber,
          amount: data.amount,
          currency: data.currency,
          method: data.method,
          status: data.status,
          checkoutUrl: data.checkoutUrl,
          payeeData: (data.payeeData as object) ?? undefined,
          expiresAt: data.expiresAt,
        },
      });
      return tx as unknown as StoredPaymentTransaction;
    },
    () => {
      const tx: StoredPaymentTransaction = {
        id,
        orderId: data.orderId,
        provider: data.provider,
        externalId: data.externalId,
        providerTransactionId: data.providerTransactionId ?? null,
        requestNumber: data.requestNumber ?? null,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        status: data.status,
        checkoutUrl: data.checkoutUrl ?? null,
        payeeData: data.payeeData ?? null,
        expiresAt: data.expiresAt ?? null,
        createdAt: now,
        updatedAt: now,
      };
      memoryTransactions.set(tx.id, tx);
      return tx;
    }
  );
}

export async function getTransactionByExternalId(externalId: string): Promise<StoredPaymentTransaction | null> {
  return executeWithFallback(
    async () => {
      const tx = await prisma.paymentTransaction.findUnique({
        where: { externalId },
      });
      return (tx as unknown as StoredPaymentTransaction) ?? null;
    },
    () => {
      for (const tx of memoryTransactions.values()) {
        if (tx.externalId === externalId) return tx;
      }
      return null;
    }
  );
}

export async function getTransactionByProviderId(providerTransactionId: string): Promise<StoredPaymentTransaction | null> {
  return executeWithFallback(
    async () => {
      const tx = await prisma.paymentTransaction.findFirst({
        where: { providerTransactionId },
      });
      return (tx as unknown as StoredPaymentTransaction) ?? null;
    },
    () => {
      for (const tx of memoryTransactions.values()) {
        if (tx.providerTransactionId === providerTransactionId) return tx;
      }
      return null;
    }
  );
}

export async function updatePaymentTransaction(
  id: string,
  updates: Partial<StoredPaymentTransaction>
): Promise<void> {
  await executeWithFallback(
    async () => {
      await prisma.paymentTransaction.update({
        where: { id },
        data: {
          ...updates,
          payeeData: (updates.payeeData as object) ?? undefined,
          updatedAt: new Date(),
        },
      });
    },
    () => {
      const tx = memoryTransactions.get(id);
      if (tx) {
        Object.assign(tx, updates, { updatedAt: new Date() });
      }
    }
  );
}

export async function recordPaymentEvent(data: {
  transactionId?: string | null;
  providerEventId?: string | null;
  eventType: string;
  status: string;
  sanitizedPayload: unknown;
}): Promise<void> {
  await executeWithFallback(
    async () => {
      await prisma.paymentEvent.create({
        data: {
          transactionId: data.transactionId ?? undefined,
          providerEventId: data.providerEventId ?? undefined,
          eventType: data.eventType,
          status: data.status,
          sanitizedPayload: (data.sanitizedPayload as object) ?? {},
        },
      });
    },
    () => {
      memoryEvents.push({
        id: `evt_${Date.now()}_${memoryEvents.length}`,
        transactionId: data.transactionId ?? null,
        providerEventId: data.providerEventId ?? null,
        eventType: data.eventType,
        status: data.status,
        sanitizedPayload: data.sanitizedPayload,
        processedAt: new Date(),
      });
    }
  );
}

// ─── Upsell / OrderOffer functions ───────────────────────────────────────────

export interface StoredOrderOffer {
  id: string;
  orderId: string;
  offerId: string;
  sequence: number;
  productId: string;
  productName: string;
  offerPriceCOP: number;
  regularPriceCOP: number;
  status: string; // pending | paid | declined | expired
  paymentTransactionId?: string | null;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const memoryOffers = new Map<string, StoredOrderOffer>();

export async function createOrderOffer(data: {
  orderId: string;
  offerId: string;
  sequence: number;
  productId: string;
  productName: string;
  offerPriceCOP: number;
  regularPriceCOP: number;
}): Promise<StoredOrderOffer> {
  const id = `offer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date();

  return executeWithFallback(
    async () => {
      const offer = await prisma.orderOffer.create({
        data: {
          orderId: data.orderId,
          offerId: data.offerId,
          sequence: data.sequence,
          productId: data.productId,
          productName: data.productName,
          offerPriceCOP: data.offerPriceCOP,
          regularPriceCOP: data.regularPriceCOP,
          status: 'pending',
        },
      });
      return offer as unknown as StoredOrderOffer;
    },
    () => {
      const offer: StoredOrderOffer = {
        id,
        orderId: data.orderId,
        offerId: data.offerId,
        sequence: data.sequence,
        productId: data.productId,
        productName: data.productName,
        offerPriceCOP: data.offerPriceCOP,
        regularPriceCOP: data.regularPriceCOP,
        status: 'pending',
        paymentTransactionId: null,
        paidAt: null,
        createdAt: now,
        updatedAt: now,
      };
      memoryOffers.set(id, offer);
      return offer;
    }
  );
}

export async function getOrderOfferById(id: string): Promise<StoredOrderOffer | null> {
  return executeWithFallback(
    async () => {
      const offer = await prisma.orderOffer.findUnique({ where: { id } });
      return (offer as unknown as StoredOrderOffer) ?? null;
    },
    () => memoryOffers.get(id) ?? null
  );
}

export async function updateOrderOffer(
  id: string,
  updates: Partial<{ status: string; paymentTransactionId: string; paidAt: Date }>
): Promise<void> {
  await executeWithFallback(
    async () => {
      await prisma.orderOffer.update({
        where: { id },
        data: { ...updates, updatedAt: new Date() },
      });
    },
    () => {
      const offer = memoryOffers.get(id);
      if (offer) Object.assign(offer, updates, { updatedAt: new Date() });
    }
  );
}

export async function getOrderOffersByOrderId(orderId: string): Promise<StoredOrderOffer[]> {
  return executeWithFallback(
    async () => {
      const offers = await prisma.orderOffer.findMany({ where: { orderId }, orderBy: { sequence: 'asc' } });
      return offers as unknown as StoredOrderOffer[];
    },
    () => Array.from(memoryOffers.values()).filter((o) => o.orderId === orderId)
  );
}
