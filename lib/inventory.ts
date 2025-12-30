import type { Prisma, PrismaClient } from '@prisma/client';
import { InventoryTransactionCreateSchema, type InventoryTrxType } from './validators';

export type TxClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

export function computeSignedQty(trxType: InventoryTrxType, qty: number, signedQty?: number) {
  if (typeof signedQty === 'number') return signedQty;
  switch (trxType) {
    case 'RECEIPT':
    case 'TRANSFER_IN':
      return Math.abs(qty);
    case 'ISSUE':
    case 'TRANSFER_OUT':
      return -Math.abs(qty);
    case 'ADJUSTMENT':
      throw new Error('signedQty required for ADJUSTMENT');
  }
}

export async function applyInventoryDelta(tx: TxClient, params: {
  warehouseId: string;
  productId: string;
  trxType: InventoryTrxType;
  qty: number;
  signedQty?: number;
  note?: string;
  reference?: string | null;
}) {
  const { warehouseId, productId, trxType, qty, signedQty, note, reference } = params;
  const delta = computeSignedQty(trxType, qty, signedQty);

  // 1) Upsert/update InventoryBalance with non-negative guard
  // Assumes unique constraint on (warehouseId, productId)
  const existing = await (tx as any).inventoryBalance.findUnique({
    where: { warehouseId_productId: { warehouseId, productId } }
  });

  if (!existing) {
    if (delta < 0) throw new Error('Insufficient balance: cannot create negative opening');
    await (tx as any).inventoryBalance.create({
      data: {
        warehouseId,
        productId,
        qtyOnHand: delta
      }
    });
  } else {
    const newQty = Number(existing.qtyOnHand) + delta;
    if (newQty < 0) throw new Error('Insufficient balance: qtyOnHand would be negative');
    await (tx as any).inventoryBalance.update({
      where: { id: existing.id },
      data: { qtyOnHand: newQty }
    });
  }

  // 2) Insert InventoryTransaction with computed signed qty
  const trx = await (tx as any).inventoryTransaction.create({
    data: {
      warehouseId,
      productId,
      trxType,
      qty,
      signedQty: delta,
      note: note ?? null,
      reference: reference ?? null
    }
  });

  return { delta, transaction: trx };
}

export async function createTransactionAndApply(
  prisma: PrismaClient,
  input: unknown
) {
  const parsed = InventoryTransactionCreateSchema.parse(input);
  return prisma.$transaction(async (tx) => {
    return applyInventoryDelta(tx, parsed);
  });
}

