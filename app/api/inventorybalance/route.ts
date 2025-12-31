import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { toPlain } from '@/lib/json';

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

