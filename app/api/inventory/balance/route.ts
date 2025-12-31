import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { InventoryBalanceQuerySchema } from '@/lib/validators';
import { toPlain } from '@/lib/json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = InventoryBalanceQuerySchema.parse({
    warehouseId: searchParams.get('warehouseId'),
    productId: searchParams.get('productId')
  });

  const bal = await (prisma as any).inventoryBalance.findUnique({
    where: { warehouseId_productId: { warehouseId: parsed.warehouseId, productId: parsed.productId } }
  });

  return NextResponse.json(toPlain(bal ?? null));
}
