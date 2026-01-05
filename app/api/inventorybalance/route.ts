import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { toPlain } from '@/lib/json';
import { InventoryBalanceUpsertSchema } from '@/lib/validators';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await (prisma as any).inventoryBalance.findMany({
      orderBy: [{ warehouseId: 'asc' }, { productId: 'asc' }]
    });
    return NextResponse.json(toPlain(items));
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = InventoryBalanceUpsertSchema.parse(body);

    const { warehouseId, productId, ...maybeValues } = parsed as any;
    const data: Record<string, any> = {};
    for (const k of ['qtyOnHand', 'qtyReserved', 'safetyStock', 'reorderPoint'] as const) {
      if (typeof maybeValues[k] === 'number') data[k] = maybeValues[k];
    }

    const item = await (prisma as any).inventoryBalance.upsert({
      where: { warehouseId_productId: { warehouseId, productId } },
      create: { warehouseId, productId, ...data },
      update: data
    });
    return NextResponse.json(toPlain(item), { status: 201 });
  } catch (e: any) {
    const status = e?.name === 'ZodError' ? 400 : 500;
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status });
  }
}
