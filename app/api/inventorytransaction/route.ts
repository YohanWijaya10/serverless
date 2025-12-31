import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createTransactionAndApply } from '@/lib/inventory';
import { toPlain } from '@/lib/json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get('warehouseId') || undefined;
    const productId = searchParams.get('productId') || undefined;
    const trxType = searchParams.get('trxType') || undefined;
    const from = searchParams.get('from') || undefined; // ISO date
    const to = searchParams.get('to') || undefined; // ISO date
    const limitParam = searchParams.get('limit');
    const take = Math.min(Math.max(parseInt(limitParam || '100', 10) || 100, 1), 500);

    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (productId) where.productId = productId;
    if (trxType) where.trxType = trxType;
    if (from || to) {
      where.trxDate = {} as any;
      if (from) where.trxDate.gte = new Date(from);
      if (to) where.trxDate.lte = new Date(to);
    }

    const rows = await (prisma as any).inventoryTransaction.findMany({
      where,
      orderBy: [{ trxDate: 'desc' }, { trxId: 'desc' }],
      take
    });
    return NextResponse.json(toPlain(rows));
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const result = await createTransactionAndApply(prisma, body);
    return NextResponse.json(toPlain(result), { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status: 400 });
  }
}

