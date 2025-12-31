import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { toPlain } from '@/lib/json';
import { PurchaseOrderItemCreateSchema } from '@/lib/validators';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const poId = searchParams.get('poId') || undefined;
    const productId = searchParams.get('productId') || undefined;
    const limitParam = searchParams.get('limit');
    const take = Math.min(Math.max(parseInt(limitParam || '200', 10) || 200, 1), 500);

    const where: any = {};
    if (poId) where.poId = poId;
    if (productId) where.productId = productId;

    const rows = await (prisma as any).purchaseOrderItem.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      take
    });
    return NextResponse.json(toPlain(rows));
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const parsed = PurchaseOrderItemCreateSchema.parse(await req.json());
    const item = await (prisma as any).purchaseOrderItem.create({ data: parsed });
    return NextResponse.json(toPlain(item), { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? 'Error' }, { status: 400 });
  }
}

