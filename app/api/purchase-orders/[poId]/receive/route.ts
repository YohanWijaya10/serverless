import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { IdParamSchema, POReceiveSchema } from '@/lib/validators';
import { applyInventoryDelta } from '@/lib/inventory';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, ctx: { params: { poId: string } }) {
  const poId = IdParamSchema.parse(ctx.params.poId);
  const body = await req.json().catch(() => ({}));
  const parsed = POReceiveSchema.parse(body);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const po = await (tx as any).purchaseOrder.findUnique({ where: { id: poId } });
      if (!po) throw new Error('PO not found');

      const items = await (tx as any).purchaseOrderItem.findMany({ where: { poId } });
      if (items.length === 0) throw new Error('No items to receive');

      const receiveMap = new Map<string, number>();
      if (parsed.items) {
        for (const it of parsed.items) receiveMap.set(it.itemId, it.qtyToReceive);
      }

      for (const item of items) {
        const outstanding = Number(item.qtyOrdered) - Number(item.qtyReceived ?? 0);
        if (outstanding <= 0) continue;
        const qtyToReceive = parsed.items ? Math.min(outstanding, receiveMap.get(item.id) ?? 0) : outstanding;
        if (qtyToReceive <= 0) continue;

        await (tx as any).purchaseOrderItem.update({
          where: { id: item.id },
          data: { qtyReceived: Number(item.qtyReceived ?? 0) + qtyToReceive }
        });

        await applyInventoryDelta(tx, {
          warehouseId: (po as any).warehouseId, // assumes PO has warehouseId
          productId: item.productId,
          trxType: 'RECEIPT',
          qty: qtyToReceive,
          note: `PO ${poId} auto-receive`,
          reference: poId
        } as any);
      }

      const refreshedItems = await (tx as any).purchaseOrderItem.findMany({ where: { poId } });
      const allReceived = refreshedItems.every((it: any) => Number(it.qtyReceived ?? 0) >= Number(it.qtyOrdered));
      const newStatus = allReceived ? 'RECEIVED' : 'OPEN';
      const updated = await (tx as any).purchaseOrder.update({ where: { id: poId }, data: { status: newStatus } });

      return { ...updated, items: refreshedItems };
    });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status: 400 });
  }
}
