import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { PurchaseOrderCreateSchema } from '@/lib/validators';
import { toPlain } from '@/lib/json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const supplierId = searchParams.get('supplierId') || undefined;

    const where: any = {};
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;

    let pos: any[] = [];
    try {
      pos = await (prisma as any).purchaseOrder.findMany({ where, orderBy: { createdAt: 'desc' } });
    } catch (_e) {
      try {
        pos = await (prisma as any).purchaseOrder.findMany({ where, orderBy: { updatedAt: 'desc' } });
      } catch (_e2) {
        pos = await (prisma as any).purchaseOrder.findMany({ where, orderBy: { poDate: 'desc' } });
      }
    }

    if (!pos || pos.length === 0) return NextResponse.json([]);

    const getId = (p: any) => p?.id ?? p?.poId;
    const poIds = pos.map(getId).filter(Boolean);

    const items = await (prisma as any).purchaseOrderItem.findMany({
      where: { poId: { in: poIds } }
    });

    const byPoId = new Map<string, any[]>();
    for (const it of items) {
      const key = (it as any).poId as string;
      const list = byPoId.get(key) ?? [];
      list.push(it);
      byPoId.set(key, list);
    }

    const result = pos.map((p: any) => ({ ...p, items: byPoId.get(getId(p) as string) ?? [] }));
    return NextResponse.json(toPlain(result));
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = PurchaseOrderCreateSchema.parse(body);

  const result = await prisma.$transaction(async (tx) => {
    const po = await (tx as any).purchaseOrder.create({
      data: {
        supplierId: parsed.supplierId,
        status: 'OPEN',
        orderedAt: parsed.orderedAt ? new Date(parsed.orderedAt) : new Date()
      }
    });

    const itemsData = parsed.items.map((it) => ({
      poId: (po as any).id ?? (po as any).poId,
      productId: it.productId,
      qtyOrdered: it.qtyOrdered,
      qtyReceived: 0
    }));
    await (tx as any).purchaseOrderItem.createMany({ data: itemsData });

    const poId = (po as any).id ?? (po as any).poId;
    const items = await (tx as any).purchaseOrderItem.findMany({ where: { poId } });
    return { ...po, items } as any;
  });

  return NextResponse.json(toPlain(result), { status: 201 });
}

