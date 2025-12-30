import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { IdParamSchema, ProductUpdateSchema } from '@/lib/validators';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: { productId: string } }) {
  const productId = IdParamSchema.parse(ctx.params.productId);
  const item = await (prisma as any).product.findUnique({ where: { id: productId } });
  if (!item) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, ctx: { params: { productId: string } }) {
  const productId = IdParamSchema.parse(ctx.params.productId);
  const data = ProductUpdateSchema.parse(await req.json());
  const item = await (prisma as any).product.update({ where: { id: productId }, data });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, ctx: { params: { productId: string } }) {
  const productId = IdParamSchema.parse(ctx.params.productId);
  await (prisma as any).product.delete({ where: { id: productId } });
  return NextResponse.json({ ok: true });
}
